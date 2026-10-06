/** Modelo dos dados de uma pessoa. */
export type Genero = 'feminino' | 'masculino' | 'outro' | 'nao_informado' | '';

export interface CadastroPessoa {
  id: number;
  nomeCompleto: string;
  dataNascimento: string;
  genero: Genero;
  cpf: string;
  rg: string;
  nomeMae: string;
  nomePai: string;
  paisOrigem: string;
  ufOrigem: string;
  cidadeOrigem: string;
  email: string;
  telefone: string;
}

export type RascunhoPessoa = Omit<CadastroPessoa, 'id'>;
export type CampoPessoa = keyof RascunhoPessoa;
export type ErrosPessoa = Partial<Record<CampoPessoa, string>>;
export type CamposTocadosPessoa = Partial<Record<CampoPessoa, boolean>>;

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO'
] as const;

export function rascunhoPessoaEmBranco(): RascunhoPessoa {
  return {
    nomeCompleto: '',
    dataNascimento: '',
    genero: '',
    cpf: '',
    rg: '',
    nomeMae: '',
    nomePai: '',
    paisOrigem: 'Brasil',
    ufOrigem: '',
    cidadeOrigem: '',
    email: '',
    telefone: ''
  };
}
