import { Component, OnInit} from '@angular/core';
import * as moment from 'moment-timezone';
import {BloqueHorarioService} from '@service/bloqueHorario.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as _ from 'lodash';

import { FormControl, FormGroup } from '@angular/forms';
import { HorarioModel } from '@model/horario-model';
import { MatrizHorariaModel } from '@model/matriz-horaria-model';
import { MatrizHorariaTransferObject } from './DataTransfer/matriz-horaria-transfer-object';
import { ClaseDiaModel } from '@model/clase-dia-model';
import { BloqueHorarioTransferObject } from './DataTransfer/bloque-horario-transfer-object';
import { PeriodoModel } from '@model/periodo-model';

moment.locale('es');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor(
    private BloqueHorarioService: BloqueHorarioService,
    private AlertService: NzMessageService          
  ){}
  //Variables--------------

  //Arreglos---------------
  BloqueHorarioData: any[];
  HorariosData: HorarioModel[];
  MatrizHorariaData: MatrizHorariaModel[];
  MatrizHorariaKeys: Number [] = [];
  HorariosView: String[] = [];
  //-----------------------

  visibleHorarios: Boolean = false;
  visibleMatrizHorariaForm: Boolean = false;
  totalHoras: number = 0;
  selectData = null;

  //-----------------------
  
  //FormControls-----------
  observacion = new FormControl('');

  matrizHorariaForm = new FormGroup({
    Codigo: new FormControl(''),
    Descripcion: new FormControl(''),
    Observacion: new FormControl('')
  });
  //-----------------------


  ngOnInit():void{
    this.BloqueHorarioService
    .getMatrizHoraria()
    .toPromise()
    .then((data: MatrizHorariaModel[])=>{
      this.MatrizHorariaData = data;
      this.MatrizHorariaData.forEach(entry=>this.MatrizHorariaKeys.push(entry.id));
      //console.log(this.MatrizHorarioData);

      //Retornamos para resolver la promesa
      return this.MatrizHorariaData[0].id;
    })
    .then((id: Number)=>{
      this.BloqueHorarioService
      .getBloqueHorario(id)
      .toPromise()
      .then((data: any[])=>{
        //Agrupamos
        const groupedData = _.groupBy(data, entity => entity.claseDia.nombre);
        //Lo transformamos a arreglo
        this.BloqueHorarioData = Object.values(groupedData);
        console.log(this.BloqueHorarioData);
      })
      .catch((error)=>console.log(error));
    })
    .catch((error)=> console.log(error));
  }



  //Functions----------------------------
  mostrarFormularioMatrizHoraria():void{
    this.visibleMatrizHorariaForm = true;
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

  actualizarMatrizHoraria(): void{

  }

  actualizarBloquesHorarios():void{

  }

  async crearBloquesHorarios(bloque: BloqueHorarioTransferObject){
    let result = await this.BloqueHorarioService.postBloqueHorario(bloque).toPromise();
    console.log(result);
  }

  async autoGenerarBloquesHorarios(id: Number): Promise<void>{
    let clasesDias: ClaseDiaModel[] = await this.BloqueHorarioService.getClaseDia().toPromise();
    let periodos: PeriodoModel[] = await this.BloqueHorarioService.getPeriodo().toPromise();
    let postObjects: BloqueHorarioTransferObject[]=[];
    
    clasesDias.forEach((clasedia)=>{
      periodos.forEach((periodo)=>{
        let bodyObject: BloqueHorarioTransferObject = {
          claseDiaId: clasedia.id,
          estado: true,
          periodoId: periodo.id,
          matrizHorariaId: id,
          descripcion: ' ',
          observacion: ' '
        }
        postObjects.push(bodyObject);
      })
    })

    postObjects.forEach(async (element)=>{
      await this.crearBloquesHorarios(element);
    });
  }
  //-------------------------------------

  //Modal Handle Function
  handleCloseHorarios():void{
    this.visibleHorarios = false;
    this.HorariosData = [];
    this.HorariosView = [];
    this.totalHoras = 0;
  }

  //Form Handle Function
  handleCloseMatrizHorariaForm(): void{
    this.visibleMatrizHorariaForm = false;
    this.matrizHorariaForm.reset();
  }

  handleOkMatrizHorariaForm(): void{
      let bodyObject: MatrizHorariaTransferObject = {
        codigo: this.matrizHorariaForm.get('Codigo').value,
        descripcion: this.matrizHorariaForm.get('Descripcion').value,
        observacion: this.matrizHorariaForm.get('Observacion').value,
        estado: true,
        fechaCreacion: moment.tz('America/Tegucigalpa').toISOString()
      }; 

      this.BloqueHorarioService
      .postMatrizHoraria(bodyObject)
      .toPromise()
      .then((response: MatrizHorariaModel)=>{
        this.autoGenerarBloquesHorarios(response.id);
        this.AlertService.success("Matriz Horaria Creada");
        this.visibleMatrizHorariaForm = false;
        this.matrizHorariaForm.reset();
      })
      .catch((error)=>{ 
        this.AlertService.error("Error al crear Matriz");
        console.log(error);
    });
      
  }
}

