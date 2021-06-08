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
import { BloqueHorarioModel } from '@model/bloque-horario-model';

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
  MatrizHorariaKey: Number;
  HorariosView: String[] = [];
  //-----------------------

  visibleHorarios: Boolean = false;
  visibleMatrizHorariaForm: Boolean = false;
  totalHoras: number = 0;

  //-----------------------

  //Loading Variables------
  loadingSelectData: Boolean = false;
  loadingTableData: Boolean = false;
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
    this.loadingTableData = true;
    this.loadingSelectData = true;

    this.BloqueHorarioService
    .getMatrizHoraria()
    .toPromise()
    .then((data: MatrizHorariaModel[])=>{

      this.MatrizHorariaData = data;
      this.MatrizHorariaKey = this.MatrizHorariaData[0].id;
      //this.MatrizHorariaData.forEach(entry=>this.MatrizHorariaKeys.push(entry.id));
      //console.log(this.MatrizHorarioData);

      //Retornamos para resolver la promesa
      return this.MatrizHorariaData[0].id;
    })
    .then((id: Number)=>{
      this.BloqueHorarioService
      .getBloqueHorario(id)
      .toPromise()
      .then((data: BloqueHorarioModel[])=>{
        //Agrupamos
        const groupedData = _.groupBy(data, entity => entity.claseDia.nombre);
        //Lo transformamos a arreglo
        this.BloqueHorarioData = Object.values(groupedData);
      })
      .finally(()=>{
        this.loadingTableData = false;
        this.loadingSelectData = false;
      })
      .catch((error)=>this.handleError(error));
    })
    .catch((error)=> this.handleError(error));
  }


  //Functions----------------------------
  mostrarFormularioMatrizHoraria():void{
    this.visibleMatrizHorariaForm = true;
  }

  mostrarObservacion(data): void {
    //console.log(data.descripcion);
    this.observacion.setValue(data.descripcion);
  }

  obtenerBloquesHorariosId(id:Number):void{

  }

  obtenerHorarios(event): void {
    this.BloqueHorarioService
    .getHorario(event.target.value)
    .toPromise()
    .then((data: HorarioModel[]) =>{
      this.HorariosData = data;
      
      this.HorariosData.forEach(element =>{
        this.totalHoras+= moment(element.horaFinal).diff(moment(element.horaInicio),'hours');
        this.HorariosView.push(moment(element.horaInicio).format('HH') + ' a ' + moment(element.horaFinal).format('HH'));
      })

      this.visibleHorarios = true;
    }).catch((error)=>this.handleError(error))
  }

  actualizarMatrizHoraria(): void{
    this.loadingTableData = true;
    this.loadingSelectData = true;

    this.BloqueHorarioService
    .getMatrizHoraria()
    .toPromise()
    .then((data: MatrizHorariaModel[])=>{
      this.MatrizHorariaData = data;
      this.MatrizHorariaKey = this.MatrizHorariaData[0].id;

      return this.MatrizHorariaData[0].id;
    })
    .then((id: Number)=>{
      this.actualizarBloquesHorarios(id);
    })
    .catch((error)=> this.handleError(error))
  }

  actualizarBloquesHorarios(id: Number):void{
    this.BloqueHorarioService
      .getBloqueHorario(id)
      .toPromise()
      .then((data: BloqueHorarioModel[])=>{
        const groupedData = _.groupBy(data, entity => entity.claseDia.nombre);
        this.BloqueHorarioData = Object.values(groupedData);
      })
      .finally(()=>{
        this.loadingTableData = false;
        this.loadingSelectData = false;
      })
      .catch((error)=>this.handleError(error));
  }

  async crearBloquesHorarios(bloque: BloqueHorarioTransferObject){
    try {
      await this.BloqueHorarioService.postBloqueHorario(bloque).toPromise();
    } catch (error) {
      this.handleError(error);
    }
  }

  async autoGenerarBloquesHorarios(id: Number): Promise<void>{
    try {
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
    } catch (error) {
      this.handleError(error);    
    }
    
  }
  //-------------------------------------
  //Error Handle-------------------------

  handleError(error:any){
    console.error(error);
    this.AlertService.error(`Ha ocurrido un error Inesperado, Codigo:${error.status}`);
  }

  //-------------------------------------
  //Select Handle Change-----------------

  handleChangeMatrizHorariaSelect():void{
    this.loadingTableData = true;

    this.BloqueHorarioService
    .getBloqueHorario(this.MatrizHorariaKey)
    .toPromise()
    .then((data: BloqueHorarioModel[])=>{
      const groupedData = _.groupBy(data, entity => entity.claseDia.nombre);
      this.BloqueHorarioData = Object.values(groupedData);

    })
    .finally(()=>{
      this.loadingTableData = false;
    })
    .catch((error)=> this.handleError(error))
  }


  //-------------------------------------
  //Modal Handle Function
  handleCloseHorarios():void{
    this.visibleHorarios = false;
    this.HorariosData = [];
    this.HorariosView = [];
    this.totalHoras = 0;
  }


  //PrintID
  printID(id):void{
    console.log(id)
  }
  //
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
        this.actualizarMatrizHoraria();
        this.visibleMatrizHorariaForm = false;
        this.matrizHorariaForm.reset();
      })
      .catch((error)=>{ 
        this.handleError(error);
    });
      
  }
}

