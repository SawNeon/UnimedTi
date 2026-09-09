import { api } from '../../../shared/services/api';
import type {
  ClosingDTO,
  ImportResultDTO,
  PrinterDTO,
  PrinterPayload,
  ReadingDTO,
  ReadingPayload
} from '../../../shared/types/Printer';

export const PrinterService = {
  getAll: async (): Promise<PrinterDTO[]> => (await api.get('/printers')).data,

  create: async (payload: PrinterPayload): Promise<PrinterDTO> =>
    (await api.post('/printers', payload)).data,

  update: async (id: string, payload: PrinterPayload): Promise<PrinterDTO> =>
    (await api.put(`/printers/${id}`, payload)).data,

  /** Recusado quando a impressora já tem leitura lançada; use inativar. */
  remove: async (id: string): Promise<void> => {
    await api.delete(`/printers/${id}`);
  },

  readings: async (competence: string): Promise<ReadingDTO[]> =>
    (await api.get('/printers/readings', { params: { competence } })).data,

  /** Cria as leituras do mês com o contador inicial vindo do fechamento anterior. */
  openCompetence: async (competence: string): Promise<ReadingDTO[]> =>
    (await api.post('/printers/readings/open', null, { params: { competence } })).data,

  importPrintWay: async (competence: string, file: File): Promise<ImportResultDTO> => {
    const form = new FormData();
    form.append('file', file);
    return (await api.post('/printers/readings/import', form, { params: { competence } })).data;
  },

  updateReading: async (id: string, payload: ReadingPayload): Promise<ReadingDTO> =>
    (await api.put(`/printers/readings/${id}`, payload)).data,

  closing: async (competence: string): Promise<ClosingDTO> =>
    (await api.get('/printers/closing', { params: { competence } })).data
};
