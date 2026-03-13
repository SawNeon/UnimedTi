import { useEffect, useState } from 'react';
import { AssetService } from '../services/AssetService';
import type { AssetDTO } from '../types/Asset';
import styles from './ProductForm.module.css';
import { PlusCircle, Package } from '@phosphor-icons/react';