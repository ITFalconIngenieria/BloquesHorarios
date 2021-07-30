import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { PeriodoModel } from '@model/periodo-model';
import { ClaseDiaModel } from '@model/clase-dia-model';
import { DiaSemanaModel } from '@model/dia-semana-model';
import { FeriadosModel } from '@model/feriados-model';
import { HorarioModel } from '@model/horario-model';
import { BloqueHorarioModel } from '@model/bloque-horario-model';
import { MatrizHorariaModel } from '@model/matriz-horaria-model';
import { HorarioTransferObject } from '@data-transfer/horario-transfer-object';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class BloqueHorarioService {

  constructor(
    private http: HttpClient
  ) { }

  vistaMatrizHoraria() {
    return this.http.get<any[]>(`${apiUrl}vmatriz-horaria`);
  }

  // Matriz horaria
  getMatrizHoraria() {
    return this.http.get<MatrizHorariaModel[]>(`${apiUrl}matriz-horarias`);
  }

  postMatrizHoraria(matriz) {
    return this.http.post<MatrizHorariaModel>(`${apiUrl}matriz-horarias`, matriz);
  }

  putMatrizHoraria(id, matriz) {
    return this.http.put<MatrizHorariaModel[]>(`${apiUrl}matriz-horarias/${id}`, matriz);
  }

  deleteMatrizHoraria(id, matriz) {
    return this.http.patch<MatrizHorariaModel[]>(`${apiUrl}matriz-horarias/${id}`, matriz);
  }

  // Bloque horario
  getBloqueHorario(id) {
    return this.http.get<BloqueHorarioModel[]>(`${apiUrl}bloque-horarios?filter={"where":{"matrizHorariaId":"${id}"},"include":[{"relation":"matrizHoraria"},{"relation":"claseDia"},{"relation":"periodo"}]}`);
  }

  postBloqueHorario(bloque) {
    return this.http.post<BloqueHorarioModel>(`${apiUrl}bloque-horarios`, bloque);
  }

  putBloqueHorario(id, bloque) {
    return this.http.put<BloqueHorarioModel[]>(`${apiUrl}bloque-horarios/${id}`, bloque);
  }

  deleteBloqueHorario(id, bloque) {
    return this.http.patch<BloqueHorarioModel[]>(`${apiUrl}bloque-horarios/${id}`, bloque);
  }

  // Periodo
  getPeriodo() {
    return this.http.get<PeriodoModel[]>(`${apiUrl}periodos`);
  }

  postPeriodo(periodo) {
    return this.http.post<PeriodoModel>(`${apiUrl}periodos`, periodo);
  }

  putPeriodo(id, periodo) {
    return this.http.put<PeriodoModel[]>(`${apiUrl}periodos/${id}`, periodo);
  }

  deletePeriodo(id, periodo) {
    return this.http.patch<PeriodoModel[]>(`${apiUrl}periodos/${id}`, periodo);
  }

  // Clase de dia 
  getClaseDia() {
    return this.http.get<ClaseDiaModel[]>(`${apiUrl}clase-dias?filter={"where":{"estado":"true"}}`);
  }

  postClaseDia(claseDia) {
    return this.http.post<ClaseDiaModel>(`${apiUrl}clase-dias`, claseDia);
  }

  putClaseDia(id, claseDia) {
    return this.http.put<ClaseDiaModel[]>(`${apiUrl}clase-dias/${id}`, claseDia);
  }

  deleteClaseDia(id, claseDia) {
    return this.http.patch<ClaseDiaModel[]>(`${apiUrl}clase-dias/${id}`, claseDia);
  }

  // Clase de dia --- Dia Semana
  getDiaSemana() {
    return this.http.get<DiaSemanaModel[]>(`${apiUrl}dias-semanas`);
  }

  postDiaSemana(diaSemana) {
    return this.http.post<DiaSemanaModel>(`${apiUrl}dias-semanas`, diaSemana);
  }

  putDiaSemana(id, diaSemana) {
    return this.http.put<DiaSemanaModel[]>(`${apiUrl}dias-semanas/${id}`, diaSemana);
  }

  deleteDiaSemana(id, diaSemana) {
    return this.http.patch<DiaSemanaModel[]>(`${apiUrl}dias-semanas/${id}`, diaSemana);
  }

  // Clase de dia --- Feriados
  getFeriados() {
    return this.http.get<FeriadosModel[]>(`${apiUrl}feriados`);
  }

  postFeriados(feriado) {
    return this.http.post<FeriadosModel>(`${apiUrl}feriados`, feriado);
  }

  putFeriados(id, feriado) {
    return this.http.put<FeriadosModel[]>(`${apiUrl}feriados/${id}`, feriado);
  }

  deleteFeriados(id, feriado) {
    return this.http.patch<FeriadosModel[]>(`${apiUrl}feriados/${id}`, feriado);
  }

  // Horario
  getHorario(id) {
    return this.http.get<HorarioModel[]>(`${apiUrl}horarios?filter={"where":{"bloqueHorarioId":"${id}"}}`);
  }

  postHorario(horario: HorarioTransferObject) {
    return this.http.post<any>(`${apiUrl}horarios`, horario);
  }

  putHorario(id, horario) {
    return this.http.put<HorarioModel[]>(`${apiUrl}horarios/${id}`, horario);
  }

  deleteHorario(id, horario) {
    return this.http.patch<HorarioModel[]>(`${apiUrl}horarios/${id}`, horario);
  }

}
