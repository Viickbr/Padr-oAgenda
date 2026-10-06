import { CadastroPessoa, ErrosPessoa, RascunhoPessoa } from './pessoa.model';

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

function obrigatorio(valor: string, campo: string): string | null {
  return valor.trim() ? null : `${campo} é obrigatório.`;
}

function tamanhoEntre(valor: string, min: number, max: number, campo: string): string | null {
  const texto = valor.trim();
  if (!texto) return null;
  return texto.length < min || texto.length > max
    ? `${campo} deve ter entre ${min} e ${max} caracteres.`
    : null;
}

function primeiroErro(...mensagens: Array<string | null>): string | null {
  return mensagens.find(mensagem => mensagem !== null) ?? null;
}

export function validarNome(nome: string, campo: string): string | null {
  const texto = nome.trim().replace(/\s+/g, ' ');
  return primeiroErro(
    obrigatorio(texto, campo),
    tamanhoEntre(texto, 3, 100, campo),
    /\d/.test(texto) ? `${campo} não pode conter números.` : null,
    /[^\p{L}\s'’-]/u.test(texto) ? `${campo} contém caracteres inválidos.` : null
  );
}

export function validarDataNascimento(data: string): string | null {
  if (!data) return 'A data de nascimento é obrigatória.';
  const nascimento = new Date(`${data}T00:00:00`);
  if (Number.isNaN(nascimento.getTime())) return 'Data de nascimento inválida.';

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (nascimento > hoje) return 'A data de nascimento não pode estar no futuro.';

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade > 120 ? 'A data de nascimento deve corresponder a uma idade de até 120 anos.' : null;
}

export function validarCpf(cpf: string): string | null {
  const digitos = apenasDigitos(cpf);
  if (!digitos) return 'O CPF é obrigatório.';
  if (digitos.length !== 11) return 'O CPF deve ter 11 dígitos.';
  if (/^(\d)\1{10}$/.test(digitos)) return 'CPF inválido.';

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(digitos[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(digitos[9])) return 'CPF inválido.';

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(digitos[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(digitos[10]) ? null : 'CPF inválido.';
}

export function validarRg(rg: string): string | null {
  const valor = rg.trim().toUpperCase();
  if (!valor) return 'O RG é obrigatório.';
  if (!/^[A-Z0-9.-]+$/.test(valor)) return 'O RG contém caracteres inválidos.';
  const quantidade = valor.replace(/[^A-Z0-9]/g, '').length;
  if (quantidade < 5 || quantidade > 14) return 'O RG deve ter entre 5 e 14 caracteres válidos.';
  if (/^(.)\1+$/.test(valor.replace(/[.-]/g, ''))) return 'RG inválido.';
  return null;
}

export function validarEmail(email: string): string | null {
  const valor = email.trim().toLowerCase();
  return primeiroErro(
    obrigatorio(valor, 'O e-mail'),
    valor && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor) ? 'E-mail em formato inválido.' : null,
    tamanhoEntre(valor, 5, 150, 'O e-mail')
  );
}

export function validarTelefone(telefone: string): string | null {
  const digitos = apenasDigitos(telefone);
  return primeiroErro(
    obrigatorio(telefone, 'O telefone'),
    digitos && ![10, 11].includes(digitos.length) ? 'O telefone deve ter 10 ou 11 dígitos.' : null,
    digitos && /^(\d)\1+$/.test(digitos) ? 'Telefone inválido.' : null
  );
}

export function validarRascunhoPessoa(
  rascunho: RascunhoPessoa,
  cadastrados: CadastroPessoa[]
): ErrosPessoa {
  const erros: ErrosPessoa = {};
  const definir = (campo: keyof ErrosPessoa, mensagem: string | null) => {
    if (mensagem) erros[campo] = mensagem;
  };

  definir('nomeCompleto', validarNome(rascunho.nomeCompleto, 'O nome completo'));
  definir('dataNascimento', validarDataNascimento(rascunho.dataNascimento));
  definir('genero', obrigatorio(rascunho.genero, 'O gênero'));
  definir('cpf', validarCpf(rascunho.cpf));
  definir('rg', validarRg(rascunho.rg));
  definir('nomeMae', validarNome(rascunho.nomeMae, 'O nome da mãe'));
  definir('nomePai', validarNome(rascunho.nomePai, 'O nome do pai'));

  const cpf = apenasDigitos(rascunho.cpf);
  if (cpf && cadastrados.some(c => apenasDigitos(c.cpf) === cpf)) erros.cpf = 'Já existe um cadastro com este CPF.';

  const email = rascunho.email.trim().toLowerCase();
  if (email && cadastrados.some(c => c.email.trim().toLowerCase() === email)) {
    erros.email = 'Já existe um cadastro com este e-mail.';
  }

  definir('paisOrigem', validarNome(rascunho.paisOrigem, 'O país de origem'));
  definir('ufOrigem', obrigatorio(rascunho.ufOrigem, 'A UF de origem'));
  definir('cidadeOrigem', validarNome(rascunho.cidadeOrigem, 'A cidade de origem'));
  definir('email', primeiroErro(erros.email ?? null, validarEmail(rascunho.email)));
  definir('telefone', validarTelefone(rascunho.telefone));

  if (rascunho.ufOrigem && !/^[A-Z]{2}$/.test(rascunho.ufOrigem)) erros.ufOrigem = 'Selecione uma UF de origem válida.';

  return erros;
}
