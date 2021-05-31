import { Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import {BloqueHorarioService} from '@service/bloqueHorario.service';
import * as _ from 'lodash';

import { FormControl } from '@angular/forms';
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

  mostrarObservacion(data){
    //console.log(data.descripcion);
    this.observacion.setValue(data.descripcion);
  }

  imprimir(event){
    console.log(event.target.nzValue);
  }
  //-------------------------------------
}

