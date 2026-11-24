package com.unimedvargina.UnimedVarginhaTi.modules.users.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Aqui ficam apenas as regras de "quem pode chegar": publico ou autenticado.
 *
 * <p>Esta e a UNICA definicao de CORS do projeto. Havia uma segunda, num
 * WebMvcConfigurer, e duas regras concorrentes para a mesma coisa significam que
 * mudar uma delas nao resolve -- a outra continua valendo em algum caminho.
 *
 * <p>Quem pode fazer O QUE e decidido pelos {@code @PreAuthorize} nos controllers,
 * sobre o bean {@link AccessGuard}. Duplicar as regras por path aqui criaria uma
 * segunda fonte de verdade que sairia do ar com a primeira mudanca de rota.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Autowired
    private SecurityFilter securityFilter;

    /**
     * De onde o navegador pode chamar a API. No servidor interno e o endereco
     * pelo qual as pessoas abrem o sistema -- http://servidor:porta -- e nao
     * localhost, que so vale na maquina do desenvolvedor.
     */
    @Value("${api.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity

                // Uma chamada so: a segunda, com Customizer.withDefaults(),
                // sobrescrevia a configuracao explicita da linha anterior.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN))
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // A tela em si. Quando o JAR serve o front junto com a API,
                        // estes arquivos precisam abrir ANTES do login -- e a
                        // propria tela de login que esta neles. Nao ha dado aqui:
                        // tudo o que a tela mostra vem da API, que continua fechada.
                        .requestMatchers(HttpMethod.GET,
                                "/", "/index.html", "/assets/**",
                                "/*.svg", "/*.ico", "/*.png").permitAll()

                        // O Docker usa isto para saber se o container esta de pe. Nao
                        // da para exigir token: quem pergunta e o proprio runtime,
                        // sem login. So devolve {"status":"UP"} -- show-details esta
                        // em never no application.yaml, entao nao expoe o que ha dentro.
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/password-reset/request").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/password-reset/confirm").permitAll()
                        // O cadastro de usuario saiu daqui para /api/users, protegido
                        // por USER_MANAGEMENT no proprio controller.
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(java.util.Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origem -> !origem.isEmpty())
                .toList());

        configuration.setAllowedMethods(java.util.List.of("GET", "PATCH", "POST", "PUT", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(java.util.List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
