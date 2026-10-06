import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Cadastro,
  CampoDoFormulario,
  CamposTocados,
  CURSOS,
  Curso,
  ErrosCadastro,
  Rascunho,
  rascunhoEmBranco
} from './padrao.model';
import { validarRascunho } from './padrao.validacao';

/**
 * COMPONENTE DE REFERENCIA
 *
 * Este e o desenho que vale para qualquer formulario da disciplina.
 * Nao ha regra de validacao nenhuma aqui dentro: quem sabe validar e o
 * padrao.validacao.ts. A classe so guarda o estado e conversa com a tela.
 *
 * Quatro membros e o coracao de tudo:
 *
 *   rascunho  o que esta sendo digitado agora
 *   tocados   em quais campos a pessoa ja entrou e saiu
 *   erros     GETTER, recalculado a cada verificacao de tela
 *   salvar()  o que acontece quando o formulario e enviado
 */
@Component({
  selector: 'app-padrao',
  imports: [FormsModule],
  templateUrl: './padrao.html',
  styleUrl: './padrao.css'
})
export class Padrao {

  readonly titulo = 'Formulario padrao';

  /** exposto para o template montar o <select> sem repetir a lista */
  readonly cursos: Curso[] = CURSOS;

  rascunho: Rascunho = rascunhoEmBranco();

  tocados: CamposTocados = {};

  cadastrados: Cadastro[] = [];

  /**
   * GETTER, e nao campo.
   * Campo e calculado uma vez, na construcao. Getter e recalculado toda
   * vez que alguem o le -- e quem le e o Angular, a cada verificacao.
   * E por isso que a mensagem acompanha a digitacao sem ninguem
   * chamar "revalidar".
   */
  get erros(): ErrosCadastro {
    return validarRascunho(this.rascunho, this.cadastrados);
  }

  get quantidadeDeErros(): number {
    return Object.keys(this.erros).length;
  }

  get temErro(): boolean {
    return this.quantidadeDeErros > 0;
  }

  /** So mostra a mensagem se a pessoa JA SAIU do campo. */
  deveMostrar(campo: CampoDoFormulario): boolean {
    return this.tocados[campo] === true && this.erros[campo] !== undefined;
  }

  mensagem(campo: CampoDoFormulario): string {
    return this.erros[campo] ?? '';
  }

  marcarTocado(campo: CampoDoFormulario): void {
    this.tocados[campo] = true;
  }

  /** Ao enviar, todo campo passa a ser "tocado": e o que um formulario faz. */
  mostrarTudo(): void {
    const campos = Object.keys(this.rascunho) as CampoDoFormulario[];
    for (const campo of campos) {
      this.tocados[campo] = true;
    }
  }

  salvar(): void {
    if (this.temErro) {
      this.mostrarTudo();
      return;
    }

    // 1. uma COPIA, nunca o proprio rascunho: senao a lista e o formulario
    //    passam a apontar para o mesmo objeto e o cartao muda enquanto se digita
    // 2. sem o confirmarSenha, que nao existe no modelo
    const { confirmarSenha, ...dados } = this.rascunho;
    void confirmarSenha;

    this.cadastrados = [
      ...this.cadastrados,
      { id: this.proximoId(), ...dados }
    ];

    this.limpar();
  }

  limpar(): void {
    this.rascunho = rascunhoEmBranco();
    this.tocados = {};
  }

  remover(id: number): void {
    this.cadastrados = this.cadastrados.filter(c => c.id !== id);
  }

  private proximoId(): number {
    const maior = this.cadastrados.reduce((max, c) => Math.max(max, c.id), 0);
    return maior + 1;
  }
}
