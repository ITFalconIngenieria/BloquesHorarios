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
import { TableViewModel } from '@model/table-view-model';

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

  //ViewTable--------------
  TableDataView: TableViewModel[] = [];
  //-----------------------
  //-----------------------

  visibleHorariosForm: Boolean = false;
  visibleMatrizHorariaForm: Boolean = false;
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
        
        //Primero Llenamos con los datos que tenemos del Bloque Horario
        this.BloqueHorarioData.forEach(element=>{
          let tempObject: TableViewModel = { 
            IdBloques:[],
            Tiempo:{
              TotalHoras: [],
              Horarios: [],
            }
          };
          tempObject.ClaseDia = element[0].claseDia.nombre;
          element.forEach(item => {
            tempObject.IdBloques.push(item.id);
          });
          //Añadimos al View de la tabla
          this.TableDataView.push(tempObject);
        });
        
        //Despues de llenarlo con la informacion que teniamos de los Bloques se llenara la informacion de los horarios
        this.TableDataView.forEach(element=>{
          element.IdBloques.forEach(async item=>{
              try {
                let result: HorarioModel[] = await this.obtenerHorarios(item);
                let totalHorasTemp: number = 0;
                let horarioStringTemp: String = '';
                result.forEach(itm =>{
                  totalHorasTemp+= moment(itm.horaFinal).diff(moment(itm.horaInicio),'hours');
                  horarioStringTemp+=moment(itm.horaInicio).format('HH') + ' a '+ moment(itm.horaFinal).format('HH') + '\n';
                });
                element.Tiempo.Horarios.push(horarioStringTemp);
                element.Tiempo.TotalHoras.push(totalHorasTemp);
              } catch (error) {
                this.handleError(error);
              }
          });
        });
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

  obtenerHorarios(id: Number): Promise<HorarioModel[]> {
    return this.BloqueHorarioService.getHorario(id).toPromise();
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
        this.TableDataView = [];
        //Primero Llenamos con los datos que tenemos del Bloque Horario
        this.BloqueHorarioData.forEach(element=>{
          let tempObject: TableViewModel = { 
            IdBloques:[],
            Tiempo:{
              TotalHoras: [],
              Horarios: [],
            }
          };
          tempObject.ClaseDia = element[0].claseDia.nombre;
          element.forEach(item => {
            tempObject.IdBloques.push(item.id);
          });
          //Añadimos al View de la tabla
          this.TableDataView.push(tempObject);
        });
        
        //Despues de llenarlo con la informacion que teniamos de los Bloques se llenara la informacion de los horarios
        this.TableDataView.forEach(element=>{
          element.IdBloques.forEach(async item=>{
              try {
                let result: HorarioModel[] = await this.obtenerHorarios(item);
                let totalHorasTemp: number = 0;
                let horarioStringTemp: String = '';
                result.forEach(itm =>{
                  totalHorasTemp+= moment(itm.horaFinal).diff(moment(itm.horaInicio),'hours');
                  horarioStringTemp+=moment(itm.horaInicio).format('HH') + ' a '+ moment(itm.horaFinal).format('HH') + '\n';
                });
                element.Tiempo.Horarios.push(horarioStringTemp);
                element.Tiempo.TotalHoras.push(totalHorasTemp);
              } catch (error) {
                this.handleError(error);
              }
          });
        });
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
      this.actualizarBloquesHorarios(this.MatrizHorariaKey);
  }


  //-------------------------------------
  
  //Form Handle Function-----------------
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

  //Añadir Horarios-------------------

  agregarHorario(arrayIndex: Number,TotalHorasIndex: Number, HorariosIndex : Number,IdBloqueHorario: Number){
    console.log({
      arrayIndex,
      TotalHorasIndex,
      HorariosIndex,
      IdBloqueHorario
    })
  }

  //----------------------------------
}

