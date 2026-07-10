INSERT INTO configuracoes (chave, valor) VALUES ('horario_evento', '19h')
ON CONFLICT (chave) DO UPDATE SET valor = '19h';
