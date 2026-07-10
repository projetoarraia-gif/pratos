INSERT INTO configuracoes (chave, valor)
VALUES ('local_evento', 'Arraiá da Educação')
ON CONFLICT (chave)
DO UPDATE SET valor = 'Arraiá da Educação';
