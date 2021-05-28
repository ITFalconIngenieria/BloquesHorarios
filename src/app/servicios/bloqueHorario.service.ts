import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class BloqueHorarioService {

  constructor(
    private http: HttpClient
  ) { }

  vistaMatrizHoraria() {
    return this.http.get<any>(`${apiUrl}vmatriz-horaria`);
  }

  // Matriz horaria
  getMatrizHoraria() {
    return this.http.get<any>(`${apiUrl}matriz-horarias`);
  }

  postMatrizHoraria(matriz) {
    return this.http.post<any>(`${apiUrl}matriz-horarias`, matriz);
  }

  putMatrizHoraria(id, matriz) {
    return this.http.put<any>(`${apiUrl}matriz-horarias/${id}`, matriz);
  }

  deleteMatrizHoraria(id, matriz) {
    return this.http.patch<any>(`${apiUrl}matriz-horarias/${id}`, matriz);
  }

  // Bloque horario
  getBloqueHorario() {
    return this.http.get<any>(`${apiUrl}bloque-horarios?filter={"include":[{"relation":"matrizHoraria"},{"relation":"claseDia"},{"relation":"periodo"}]}`);
  }

  postBloqueHorario(bloque) {
    return this.http.post<any>(`${apiUrl}bloque-horarios`, bloque);
  }

  putBloqueHorario(id, bloque) {
    return this.http.put<any>(`${apiUrl}bloque-horarios/${id}`, bloque);
  }

  deleteBloqueHorario(id, bloque) {
    return this.http.patch<any>(`${apiUrl}bloque-horarios/${id}`, bloque);
  }

  // Periodo
  getPeriodo() {
    return this.http.get<any>(`${apiUrl}periodos`);
  }

  postPeriodo(periodo) {
    return this.http.post<any>(`${apiUrl}periodos`, periodo);
  }

  putPeriodo(id, periodo) {
    return this.http.put<any>(`${apiUrl}periodos/${id}`, periodo);
  }

  deletePeriodo(id, periodo) {
    return this.http.patch<any>(`${apiUrl}periodos/${id}`, periodo);
  }

  // Clase de dia 
  getClaseDia() {
    return this.http.get<any>(`${apiUrl}clase-dias`);
  }

  postClaseDia(claseDia) {
    return this.http.post<any>(`${apiUrl}clase-dias`, claseDia);
  }

  putClaseDia(id, claseDia) {
    return this.http.put<any>(`${apiUrl}clase-dias/${id}`, claseDia);
  }

  deleteClaseDia(id, claseDia) {
    return this.http.patch<any>(`${apiUrl}clase-dias/${id}`, claseDia);
  }

  // Clase de dia --- Dia Semana
  getDiaSemana() {
    return this.http.get<any>(`${apiUrl}dias-semanas`);
  }

  postDiaSemana(diaSemana) {
    return this.http.post<any>(`${apiUrl}dias-semanas`, diaSemana);
  }

  putDiaSemana(id, diaSemana) {
    return this.http.put<any>(`${apiUrl}dias-semanas/${id}`, diaSemana);
  }

  deleteDiaSemana(id, diaSemana) {
    return this.http.patch<any>(`${apiUrl}dias-semanas/${id}`, diaSemana);
  }

  // Clase de dia --- Feriados
  getFeriados() {
    return this.http.get<any>(`${apiUrl}feriados`);
  }

  postFeriados(feriado) {
    return this.http.post<any>(`${apiUrl}feriados`, feriado);
  }

  putFeriados(id, feriado) {
    return this.http.put<any>(`${apiUrl}feriados/${id}`, feriado);
  }

  deleteFeriados(id, feriado) {
    return this.http.patch<any>(`${apiUrl}feriados/${id}`, feriado);
  }

  // Horario
  getHorario() {
    return this.http.get<any>(`${apiUrl}horarios`);
  }

  postHorario(horario) {
    return this.http.post<any>(`${apiUrl}horarios`, horario);
  }

  putHorario(id, horario) {
    return this.http.put<any>(`${apiUrl}horarios/${id}`, horario);
  }

  deleteHorario(id, horario) {
    return this.http.patch<any>(`${apiUrl}horarios/${id}`, horario);
  }

}
