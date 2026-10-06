import { Cadastro, ErrosCadastro, Rascunho } from './padrao.model';

/**
 * VALIDACOES DE REFERENCIA
 *
 * O contrato de TODA funcao daqui e o mesmo:
 *
 *     string  -> ha erro, e este texto e a mensagem que o usuario le
 *     null    -> passou, nada a dizer
 *
 * E por causa desse acordo que elas se encaixam umas nas outras
 * sem adaptador nenhum. Nao devolva boolean: false nao carrega a frase.
 */

// ---------------------------------------------------------------
// 1. GENERICAS -- sabem uma regra e nada sobre pessoas
// ---------------------------------------------------------------

export function obrigatorio(valor: string, campo: string): string | null {
  return valor.trim().length === 0 ? `${campo} nao pode ficar em branco.` : null;
}

export function tamanhoEntre(
  valor: string,
  min: number,
  max: number,
  campo: string
): string | null {
  const texto = valor.trim();
  // vazio e problema do obrigatorio, nao deste aqui
  if (texto.length === 0) {
    return null;
  }
  if (texto.length < min || texto.length > max) {
    return `${campo} deve ter entre ${min} e ${max} caracteres.`;
  }
  return null;
}

export function quantidadeDeDigitos(
  valor: string,
  quantidade: number,
  campo: string
): string | null {
  const digitos = apenasDigitos(valor);
  if (digitos.length === 0) {
    return null;
  }
  return digitos.length === quantidade
    ? null
    : `${campo} deve ter ${quantidade} digitos.`;
}

export function entre(
  valor: number | null,
  min: number,
  max: number,
  campo: string
): string | null {
  if (valor === null) {
    return null;
  }
  if (!Number.isInteger(valor) || valor < min || valor > max) {
    return `${campo} deve ser um numero inteiro de ${min} a ${max}.`;
  }
  return null;
}

/**
 * Escolhe a PRIMEIRA mensagem, porque cada campo mostra um erro por vez.
 * Quatro frases empilhadas embaixo de um input nao ajudam ninguem.
 */
export function primeiroErro(...verificacoes: Array<string | null>): string | null {
  return verificacoes.find(mensagem => mensagem !== null) ?? null;
}

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

// ---------------------------------------------------------------
// 2. ESPECIFICAS -- tem logica propria
// ---------------------------------------------------------------

export function validarNome(nome: string): string | null {
  return primeiroErro(
    obrigatorio(nome, 'O nome'),
    tamanhoEntre(nome, 3, 60, 'O nome'),
    /\d/.test(nome) ? 'O nome nao pode conter numeros.' : null
  );
}

export function validarEmail(email: string): string | null {
  const formato = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return primeiroErro(
    obrigatorio(email, 'O e-mail'),
    email.trim().length > 0 && !formato.test(email.trim())
      ? 'E-mail em formato invalido.'
      : null
  );
}

export function validarCep(cep: string): string | null {
  return primeiroErro(
    obrigatorio(cep, 'O CEP'),
    quantidadeDeDigitos(cep, 8, 'O CEP')
  );
}

export function validarSenha(senha: string): string | null {
  const erroBasico = primeiroErro(
    obrigatorio(senha, 'A senha'),
    senha.length > 0 && senha.length < 8
      ? 'A senha deve ter ao menos 8 caracteres.'
      : null
  );
  if (erroBasico !== null) {
    return erroBasico;
  }
  const forte = /[a-z]/.test(senha) && /[A-Z]/.test(senha) && /\d/.test(senha);
  return forte
    ? null
    : 'A senha precisa de ao menos uma maiuscula, uma minuscula e um digito.';
}

export function validarDataNascimento(data: string): string | null {
  const vazio = obrigatorio(data, 'A data de nascimento');
  if (vazio !== null) {
    return vazio;
  }

  const nascimento = new Date(`${data}T00:00:00`);
  if (Number.isNaN(nascimento.getTime())) {
    return 'Data de nascimento invalida.';
  }

  const hoje = new Date();
  if (nascimento > hoje) {
    return 'A data de nascimento nao pode estar no futuro.';
  }

  const idade = calcularIdade(nascimento, hoje);
  if (idade < 16 || idade > 120) {
    return 'A idade deve estar entre 16 e 120 anos.';
  }
  return null;
}

function calcularIdade(nascimento: Date, hoje: Date): number {
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  const aindaNaoFezAniversario =
    mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) {
    idade = idade - 1;
  }
  return idade;
}

// ---------------------------------------------------------------
// 3. O MAPA DE ERROS -- e aqui que as regras cruzadas aparecem
// ---------------------------------------------------------------

/**
 * Devolve SO os campos com problema.
 * Ficha valida = objeto vazio: {}.
 *
 * As regras que dependem de OUTRO campo estao marcadas com [CRUZADA].
 * Repare que nenhuma delas caberia numa funcao que recebe so o
 * proprio valor -- e por isso que elas moram aqui e nao la em cima.
 */
export function validarRascunho(
  rascunho: Rascunho,
  jaCadastrados: Cadastro[]
): ErrosCadastro {
  const erros: ErrosCadastro = {};

  const defina = (campo: keyof ErrosCadastro, mensagem: string | null): void => {
    if (mensagem !== null) {
      erros[campo] = mensagem;
    }
  };

  // --- campos que se resolvem sozinhos ---
  defina('nome', validarNome(rascunho.nome));
  defina('dataNascimento', validarDataNascimento(rascunho.dataNascimento));
  defina('genero', obrigatorio(rascunho.genero, 'O genero'));
  defina('cep', validarCep(rascunho.cep));
  defina('vinculo', obrigatorio(rascunho.vinculo, 'O vinculo'));
  defina('curso', obrigatorio(rascunho.curso, 'O curso'));
  defina('senha', validarSenha(rascunho.senha));
  defina(
    'observacoes',
    tamanhoEntre(rascunho.observacoes, 0, 300, 'As observacoes')
  );

  // --- e-mail: formato + nao repetido ---
  const jaExiste = jaCadastrados.some(
    c => c.email.trim().toLowerCase() === rascunho.email.trim().toLowerCase()
  );
  defina(
    'email',
    primeiroErro(
      validarEmail(rascunho.email),
      jaExiste ? 'Ja existe um cadastro com este e-mail.' : null
    )
  );

  // --- [CRUZADA] telefone depende do vinculo ---
  const ehProfessor = rascunho.vinculo === 'professor';
  defina(
    'telefone',
    primeiroErro(
      ehProfessor ? obrigatorio(rascunho.telefone, 'O telefone') : null,
      quantidadeDeDigitos(rascunho.telefone, 11, 'O telefone')
    )
  );

  // --- [CRUZADA] matricula e semestre dependem do vinculo ---
  const ehAluno = rascunho.vinculo === 'aluno';

  if (ehAluno) {
    defina(
      'matricula',
      primeiroErro(
        obrigatorio(rascunho.matricula, 'A matricula'),
        quantidadeDeDigitos(rascunho.matricula, 7, 'A matricula')
      )
    );
    defina(
      'semestre',
      primeiroErro(
        rascunho.semestre === null ? 'O semestre e obrigatorio.' : null,
        entre(rascunho.semestre, 1, 10, 'O semestre')
      )
    );
  } else {
    // quem nao e aluno NAO PODE ter matricula nem semestre
    if (rascunho.matricula.trim().length > 0) {
      erros.matricula = 'So aluno tem matricula.';
    }
    if (rascunho.semestre !== null) {
      erros.semestre = 'So aluno tem semestre.';
    }
  }

  // --- [CRUZADA] confirmacao depende da senha ---
  defina(
    'confirmarSenha',
    primeiroErro(
      obrigatorio(rascunho.confirmarSenha, 'A confirmacao de senha'),
      rascunho.confirmarSenha.length > 0 &&
        rascunho.confirmarSenha !== rascunho.senha
        ? 'As senhas nao conferem.'
        : null
    )
  );

  return erros;
}
