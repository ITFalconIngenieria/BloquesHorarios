import { Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import {BloqueHorarioService} from '@service/bloqueHorario.service';
import { BloqueHorarioModel } from '@model/bloque-horario-model';
moment.locale('es');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor(private BloqueHorarioService: BloqueHorarioService){}
  
  tableData: BloqueHorarioModel[];

  ngOnInit(){
    this.BloqueHorarioService
    .getBloqueHorario()
    .subscribe((data:any)=> this.tableData = data);
  }

  mostrarFormulario(){
    
  }
}

