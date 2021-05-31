import { Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import {BloqueHorarioService} from '@service/bloqueHorario.service';
import * as _ from 'lodash';

import { FormControl } from '@angular/forms';
import { HorarioModel } from '@model/horario-model';
moment.locale('es');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor(private BloqueHorarioService: BloqueHorarioService){}
  //Variables--------------
  Data: any[];
  HorariosData: HorarioModel[];
  visibleHorarios:Boolean = false;
  totalHoras: number = 0;
  HorariosView: String[] = [];
  //-----------------------
  
  //FormControls-----------
  observacion = new FormControl('');
  //-----------------------


  ngOnInit(){
    this.BloqueHorarioService
    .getBloqueHorario()
    .toPromise()
    .then((data: any[]) => {
      //Agrupa la data primero usando el campo de dia
      const groupedData = _.groupBy(data, entity => entity.claseDia.nombre);
      //Lo transformamos en un arreglo para la tabla
      this.Data = Object.values(groupedData);

    });
  }



  //Functions----------------------------
  mostrarFormulario(){
    
  }

  mostrarObservacion(data): void {
    //console.log(data.descripcion);
    this.observacion.setValue(data.descripcion);
  }

  obtenerHorarios(event): void {
    this.BloqueHorarioService
    .getHorario(event.target.value)
    .toPromise()
    .then((data: any[]) =>{
      this.HorariosData = data;
      
      this.HorariosData.forEach(element =>{
        this.totalHoras+= moment(element.horaFinal).diff(moment(element.horaInicio),'hours');
        this.HorariosView.push(moment(element.horaInicio).format('HH') + ' a ' + moment(element.horaFinal).format('HH'));
      })


      console.log(`Horas Totales: ${this.totalHoras}`);
      
      this.visibleHorarios = true;
    })
  }
  //-------------------------------------

  //Modal Handle Functions
  handleCloseHorarios(){
    this.visibleHorarios = false;
    this.HorariosData = [];
    this.HorariosView = [];
    this.totalHoras = 0;
  }
}

