import { Component, OnInit} from '@angular/core';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

import { FormControl, FormGroup } from '@angular/forms';

import { MatrizHorariaModel } from '@model/matriz-horaria-model';
import { MatrizHorariaTransferObject } from '@data-transfer/matriz-horaria-transfer-object';
import { TableViewModel } from '@model/table-view-model';
import { ComponentService } from '@service/component-service.service';
import { HorarioTransferObject } from '@data-transfer/horario-transfer-object';

moment.locale('es');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor(
    private ComponentService: ComponentService          
  ){}
  //Variables--------------
    InitialTime: Date = null;
    FinalTime: Date = null;
    Timeout: any = null;
  //Arreglos---------------
    MatrizHorariaData: MatrizHorariaModel[] = []
    MatrizHorariaKey: number;
    BloqueHorarioData: any[]= []
    TableDataView: TableViewModel[] = []
    SelectDeleteHorarioView: Array<{Horario:String,Id:Number}> =[];
    SelectTags: Number[] = [];
  //ViewTable--------------
  //-----------------------
  selectedDataTableViewIndex: number;
  selectedTotalHorasIndex: number;
  selectedHorariosViewIndex: number;
  selectedIdBloqueHorario: number;

  selectMatrizHorariaIndex: number = 0;

  //-----------------------
  visibleMatrizHorariaForm: Boolean = false;
  visibleHorariosModal: Boolean = false;
  visibleHorariosDeleteModal: Boolean = false;
  //-----------------------

  //Loading Variables------
  loadingSelectData: Boolean = false;
  loadingTableData: Boolean = false;
  loadingPostingHorario: Boolean = false;
  loadingDeleteHorario: Boolean = false;
  //-----------------------

  //FormControls-----------
  observacion = new FormControl('');
  matrizHorariaForm = new FormGroup({
    Codigo: new FormControl(''),
    Descripcion: new FormControl(''),
    Observacion: new FormControl('')
  });
  //-----------------------
  modifyDescripcion(event : any){
    clearTimeout(this.Timeout);
    this.Timeout = setTimeout(async ()=>{
      if(event.keyCode !== (32 || 13)){
        this.MatrizHorariaData[this.selectMatrizHorariaIndex].observacion = this.observacion.value;
        const transferObject: MatrizHorariaTransferObject = {
          codigo: this.MatrizHorariaData[this.selectMatrizHorariaIndex].codigo,
          fechaCreacion: this.MatrizHorariaData[this.selectMatrizHorariaIndex].fechaCreacion,
          descripcion: this.MatrizHorariaData[this.selectMatrizHorariaIndex].descripcion,
          observacion: this.observacion.value,
          estado: this.MatrizHorariaData[this.selectMatrizHorariaIndex].estado
        }
        await this.ComponentService.updateMatrizHorariaDescripcion(this.MatrizHorariaData[this.selectMatrizHorariaIndex].id,transferObject);
        console.log(this.MatrizHorariaData[this.selectMatrizHorariaIndex]);
      }
    },2000);
  }

  async ngOnInit(): Promise<void>{
    this.loadingTableData = true;
    this.loadingSelectData = true;

    try {
      const { MHD,MHK,BHD,TDV } = await this.ComponentService.getInitialData(
        this.MatrizHorariaData,
        this.MatrizHorariaKey,
        this.BloqueHorarioData,
        this.TableDataView  
      );
      this.MatrizHorariaData = MHD;
      this.MatrizHorariaKey = MHK;
      this.BloqueHorarioData = BHD;
      this.TableDataView = TDV;
      
      this.observacion.setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex].observacion);
      //console.table(this.MatrizHorariaData);
    } catch (error) {
      this.ComponentService.handleError(error);
    }
    
    this.loadingTableData = false;
    this.loadingSelectData = false;
  }

  //Functions----------------------------
  mostrarFormularioMatrizHoraria():void{
    this.visibleMatrizHorariaForm = true;
  }

  //-------------------------------------
  //Select Handle Change-----------------
  async handleChangeMatrizHorariaSelect():Promise<void>{
      this.loadingTableData = true;
      this.loadingSelectData = true;
      this.observacion.setValue('');
      try{
      const { MHD,MHK,BHD,TDV } = await this.ComponentService.updateMatrizHoraria(
          this.MatrizHorariaData,
          this.MatrizHorariaKey,
          this.BloqueHorarioData,
          this.TableDataView 
        );
      this.MatrizHorariaData = MHD;
      this.MatrizHorariaKey = MHK;
      this.BloqueHorarioData = BHD;
      this.TableDataView = TDV;
      
      this.selectMatrizHorariaIndex = this.ComponentService.returnIndexMatrizHorariaData(this.MatrizHorariaData,this.MatrizHorariaKey);
      this.observacion.setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex].descripcion);
      }catch(error){
        this.ComponentService.handleError(error);
      }
      this.loadingTableData = false;
      this.loadingSelectData = false;
  }
  //-------------------------------------
  
  //Form Handle Function-----------------
  handleCloseMatrizHorariaForm(): void{
    this.visibleMatrizHorariaForm = false;
    this.matrizHorariaForm.reset();
  }

  async handleOkMatrizHorariaForm(): Promise<void>{
      let bodyObject: MatrizHorariaTransferObject = {
        codigo: this.matrizHorariaForm.get('Codigo').value,
        descripcion: this.matrizHorariaForm.get('Descripcion').value,
        observacion: this.matrizHorariaForm.get('Observacion').value,
        estado: true,
        fechaCreacion: new Date().toISOString()
      }; 
      try{
        this.MatrizHorariaData = await this.ComponentService.postMatrizHoraria(bodyObject);
      }catch(error){
        this.ComponentService.handleError(error);
      }
      this.visibleMatrizHorariaForm = false;
      this.matrizHorariaForm.reset();      
  }

  //Añadir Horarios-------------------

  //Handle Modal-----------------------
  async handleOkModalHorarios(){
    this.loadingPostingHorario = true;
    const InitialHour = this.InitialTime.toISOString()
    const FinalHour = this.FinalTime.toISOString()
    this.InitialTime= null;
    this.FinalTime=null;

    const transferObject: HorarioTransferObject = {
      bloqueHorarioId: this.selectedIdBloqueHorario,
      horaInicio: InitialHour, 
      horaFinal: FinalHour,
      estado: true
    }

    const IdHorario = await this.ComponentService.postHorario(transferObject);
    const tableDataUpdated = this.ComponentService.updateTableData(
      this.TableDataView,
      this.selectedIdBloqueHorario,
      this.selectedDataTableViewIndex,
      this.selectedHorariosViewIndex,
      this.selectedTotalHorasIndex,
      InitialHour,
      FinalHour,
      IdHorario
    );
    
    this.TableDataView = tableDataUpdated;
    this.loadingPostingHorario = false;
    this.visibleHorariosModal = false;
  }


  handleCancelModalHorarios(){
    this.visibleHorariosModal = false;
    this.InitialTime= null;
    this.FinalTime=null;
  }

  //----------------------------------
  handleSaveDataInVariables(arrayIndex: number,totalHorasIndex: number, horariosIndex : number,idBloqueHorario: number){
    this.selectedDataTableViewIndex = arrayIndex;
    this.selectedTotalHorasIndex = totalHorasIndex;
    this.selectedHorariosViewIndex = horariosIndex;
    this.selectedIdBloqueHorario = idBloqueHorario;

    console.log(this.TableDataView[this.selectedDataTableViewIndex]);
  }

  openHorarioModal(){
    this.visibleHorariosModal = true;
  }

  //----------------------------------

  openModalDeleteHorarios(){
    this.visibleHorariosDeleteModal = true;
    this.SelectDeleteHorarioView = this.TableDataView[this.selectedDataTableViewIndex].Tiempo.Horarios[this.selectedHorariosViewIndex];
    //console.log(this.TableDataView[this.selectedDataTableViewIndex]);
  }

  handleCancelDeleteHorarios(){
    this.visibleHorariosDeleteModal = false;
    this.SelectDeleteHorarioView=[];
    this.SelectTags=[];
  }

  async handleOkDeleteHorarios(){
    this.loadingDeleteHorario = true;

    const object = await this.ComponentService.deleteHorarios(this.TableDataView[this.selectedDataTableViewIndex],this.SelectTags);
    this.TableDataView[this.selectedDataTableViewIndex] = object;
    
    this.loadingDeleteHorario = false;
    this.visibleHorariosDeleteModal = false;
    this.SelectTags=[];
  }

  //----------------------------------
  //----------------------------------
}

