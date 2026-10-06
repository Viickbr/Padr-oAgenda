import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CadastroPessoa,
  CampoPessoa,
  CamposTocadosPessoa,
  ErrosPessoa,
  RascunhoPessoa,
  UFS,
  rascunhoPessoaEmBranco
} from './pessoa.model';
import { apenasDigitos, validarRascunhoPessoa } from './pessoa.validacao';

@Component({
  selector: 'app-pessoa',
  imports: [FormsModule],
  templateUrl: './pessoa.html',
  styleUrl: './pessoa.css'
})
export class Pessoa {
  readonly titulo = 'Cadastro de Pessoa';
  readonly ufs = UFS;

  rascunho: RascunhoPessoa = rascunhoPessoaEmBranco();
  tocados: CamposTocadosPessoa = {};
  cadastrados: CadastroPessoa[] = [];

  get erros(): ErrosPessoa {
    return validarRascunhoPessoa(this.rascunho, this.cadastrados);
  }

  get quantidadeDeErros(): number {
    return Object.keys(this.erros).length;
  }

  get temErro(): boolean {
    return this.quantidadeDeErros > 0;
  }

  deveMostrar(campo: CampoPessoa): boolean {
    return this.tocados[campo] === true && this.erros[campo] !== undefined;
  }

  mensagem(campo: CampoPessoa): string {
    return this.erros[campo] ?? '';
  }

  marcarTocado(campo: CampoPessoa): void {
    this.tocados[campo] = true;
  }

  formatarCpf(): void {
    const d = apenasDigitos(this.rascunho.cpf).slice(0, 11);
    this.rascunho.cpf = d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  formatarTelefone(): void {
    const d = apenasDigitos(this.rascunho.telefone).slice(0, 11);
    if (d.length <= 10) {
      this.rascunho.telefone = d
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      this.rascunho.telefone = d
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  }

  mostrarTudo(): void {
    const campos = Object.keys(this.rascunho) as CampoPessoa[];
    for (const campo of campos) this.tocados[campo] = true;
  }

  salvar(): void {
    if (this.temErro) {
      this.mostrarTudo();
      return;
    }

    this.cadastrados = [
      ...this.cadastrados,
      { id: this.proximoId(), ...this.rascunho }
    ];
    this.limpar();
  }

  limpar(): void {
    this.rascunho = rascunhoPessoaEmBranco();
    this.tocados = {};
  }

  remover(id: number): void {
    this.cadastrados = this.cadastrados.filter(c => c.id !== id);
  }

  private proximoId(): number {
    return this.cadastrados.reduce((maior, cadastro) => Math.max(maior, cadastro.id), 0) + 1;
  }
}
