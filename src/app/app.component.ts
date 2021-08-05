import { Component, OnInit} from '@angular/core';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { NzModalService } from 'ng-zorro-antd/modal';
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
    private ComponentService: ComponentService,
    private ModalService: NzModalService          
  ){}

  //Other Variables-----------
  InitialTime: Number = null;
  FinalTime: Number = null;
  Timeout: any = null;
  //--------------------------

  //Component Arrays----------------------------------------------------------------------------------------------------
  MatrizHorariaData: MatrizHorariaModel[] = []
  MatrizHorariaKey: Number;
  BloqueHorarioData: any[]= []
  TableDataView: TableViewModel[] = []
  SelectDeleteHorarioView: Array<{Horario:String,Id:Number}> =[];
  SelectTags: Number[] = [];
  HoursList: Array<{Tag:String,Hour:Number}> = 
  [
    {Tag:"00",Hour:0},{Tag:"01",Hour:1},{Tag:"02",Hour:2},{Tag:"03",Hour:3},{Tag:"04",Hour:4},{Tag:"05",Hour:5},
    {Tag:"06",Hour:6},{Tag:"07",Hour:7},{Tag:"08",Hour:8},{Tag:"09",Hour:9},{Tag:"10",Hour:10},{Tag:"11",Hour:11},
    {Tag:"12",Hour:12},{Tag:"13",Hour:13},{Tag:"14",Hour:14},{Tag:"15",Hour:15},{Tag:"16",Hour:16},{Tag:"17",Hour:17},
    {Tag:"18",Hour:18},{Tag:"19",Hour:19},{Tag:"20",Hour:20},{Tag:"21",Hour:21},{Tag:"22",Hour:22},{Tag:"23",Hour:23}
  ]
  DisbleHoursList: Array<Array<Number>> = [];
  //---------------------------------------------------------------------------------------------------------------------

  //Select Value Variables-------------
  selectedDataTableViewIndex: Number;
  selectedTotalHorasIndex: Number;
  selectedHorariosViewIndex: Number;
  selectedIdBloqueHorario: Number;
  selectMatrizHorariaIndex: Number = 0;
  //------------------------------------

  //Visible Control Variables-----------------
  visibleMatrizHorariaForm: Boolean = false;
  visibleHorariosModal: Boolean = false;
  visibleHorariosDeleteModal: Boolean = false;
  //------------------------------------------

  //Loading Variables-------------------------
  loadingSelectData: Boolean = false;
  loadingTableData: Boolean = false;
  loadingPostingHorario: Boolean = false;
  loadingDeleteHorario: Boolean = false;
  loadingDeleteMatrizHoraria: Boolean = false;
  loadingPostMatrizHoraria: Boolean = false;
  //------------------------------------------

  //Form Group-----------------------
  viewMatrizHoraria = new FormGroup({
    Descripcion: new FormControl(''),
    Observacion: new FormControl(''),
  });
  matrizHorariaForm = new FormGroup({
    Codigo: new FormControl(''),
    Descripcion: new FormControl(''),
    Observacion: new FormControl('')
  });
  //---------------------------------
  
  async ngOnInit(): Promise<void>{
    this.loadingTableData = true;
    this.loadingSelectData = true;

    try {
      const { MHD,MHK,BHD,TDV } = await this.ComponentService.getInitialData();
      this.MatrizHorariaData = MHD;
      this.MatrizHorariaKey = MHK;
      this.BloqueHorarioData = BHD;
      this.TableDataView = TDV;
      
      this.viewMatrizHoraria.get('Observacion').setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].observacion);
      this.viewMatrizHoraria.get('Descripcion').setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].descripcion);
      
    } catch (error) {
      this.ComponentService.handleError(error);
    }
    
    this.loadingTableData = false;
    this.loadingSelectData = false;
  }

  //HandleOpenCloseModal or HandleOpenCloseDrawer----------------------------------------------------------------------------------------------------------
  openHorarioModal(){
    this.visibleHorariosModal = true;
  }

  handleCancelModalHorarios(){
    this.visibleHorariosModal = false;
    this.InitialTime= null;
    this.FinalTime=null;
  }

  openModalDeleteHorarios(){
    this.visibleHorariosDeleteModal = true;
    this.SelectDeleteHorarioView = this.TableDataView[this.selectedDataTableViewIndex.valueOf()].Tiempo.Horarios[this.selectedHorariosViewIndex.valueOf()];
  }

  handleCancelDeleteHorarios(){
    this.visibleHorariosDeleteModal = false;
    this.SelectDeleteHorarioView=[];
    this.SelectTags=[];
  }

  handleCloseMatrizHorariaForm(): void{
    this.visibleMatrizHorariaForm = false;
    this.matrizHorariaForm.reset();
  }

  openFormularioMatrizHoraria():void{
    this.visibleMatrizHorariaForm = true;
  }

  openDeleteConfirmDialog():void{
    this.ModalService.confirm({
      nzTitle: `Esta seguro que quiere borra la Matriz Horaria:`,
      nzContent: `${this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].codigo}`,
      nzOkText: "Si",
      nzOnOk: async () => await this.handleDeleteMatrizHoraria(),
      nzCancelText:"No",
    });
  }
  //-------------------------------------------------------------------------------------------------------------------------------------------------------


  //HandleFunctions-----------------------------------------------------------------------------------------------------
  handleSaveDataInVariables(arrayIndex: Number,totalHorasIndex: Number, horariosIndex : Number,idBloqueHorario: Number){
    this.selectedDataTableViewIndex = arrayIndex;
    this.selectedTotalHorasIndex = totalHorasIndex;
    this.selectedHorariosViewIndex = horariosIndex;
    this.selectedIdBloqueHorario = idBloqueHorario;
  }

  async handleOkDeleteHorarios(){
    this.loadingDeleteHorario = true;
    const object = await this.ComponentService.deleteHorarios(this.TableDataView[this.selectedDataTableViewIndex.valueOf()],this.SelectTags);
    this.TableDataView[this.selectedDataTableViewIndex.valueOf()] = object;
    this.loadingDeleteHorario = false;
    this.visibleHorariosDeleteModal = false;
    this.SelectTags=[];
  }

  async handleChangeMatrizHorariaSelect():Promise<void>{
    this.loadingTableData = true;
    this.loadingSelectData = true;
    this.viewMatrizHoraria.get('Observacion').setValue('');
    this.viewMatrizHoraria.get('Descripcion').setValue('');
    try{
    const { MHD,BHD,TDV } = await this.ComponentService.updateMatrizHoraria(this.MatrizHorariaKey);
    this.MatrizHorariaData = MHD;
    this.BloqueHorarioData = BHD;
    this.TableDataView = TDV;
    console.log(this.MatrizHorariaKey);
    this.selectMatrizHorariaIndex = this.ComponentService.returnIndexMatrizHorariaData(this.MatrizHorariaData,this.MatrizHorariaKey);
    this.viewMatrizHoraria.get('Observacion').setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].observacion);
    this.viewMatrizHoraria.get('Descripcion').setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].descripcion);
    }catch(error){
      this.ComponentService.handleError(error);
    }
    this.loadingTableData = false;
    this.loadingSelectData = false;
  }

  async handleDeleteMatrizHoraria(): Promise<void>{
  this.loadingDeleteMatrizHoraria = true;
  this.loadingSelectData = true;
  this.loadingTableData = true;
  const id = this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].id;
  this.selectMatrizHorariaIndex = 0;
  this.MatrizHorariaData= [];
  this.BloqueHorarioData = [];
  this.TableDataView = [];
  this.MatrizHorariaKey = null;
  this.viewMatrizHoraria.get('Observacion').setValue('');
  this.viewMatrizHoraria.get('Descripcion').setValue('');


  await this.ComponentService.deleteMatrizHoraria(id);

  const { MHD,MHK,BHD,TDV } = await this.ComponentService.getInitialData();
  this.MatrizHorariaData = MHD;
  this.MatrizHorariaKey = MHK;
  this.BloqueHorarioData = BHD;
  this.TableDataView = TDV;
  
  this.viewMatrizHoraria.get('Observacion').setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].observacion);
  this.viewMatrizHoraria.get('Descripcion').setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].descripcion);
  
  this.loadingDeleteMatrizHoraria = false;
  this.loadingSelectData = false;
  this.loadingTableData = false;
  }

  async handleOkMatrizHorariaForm(): Promise<void>{
    this.loadingPostMatrizHoraria = true;
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
    this.loadingPostMatrizHoraria = false;
    this.visibleMatrizHorariaForm = false;
    this.matrizHorariaForm.reset();      
  }

  async handleOkModalHorarios(){
  this.loadingPostingHorario = true;
  const ActualDate= new Date();
  const InitialHour = new Date(
    ActualDate.getFullYear(),
    ActualDate.getMonth(),
    ActualDate.getDay(),
    this.InitialTime.valueOf(),
    0,
    0,
    0
  ).toISOString();
  const FinalHour = new Date(
    ActualDate.getFullYear(),
    ActualDate.getMonth(),
    ActualDate.getDay(),
    this.FinalTime.valueOf(),
    0,
    0,
    0
  ).toISOString();

  this.InitialTime=0;
  this.FinalTime=0;

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
  
  handleModifyTextArea(event : any){
    clearTimeout(this.Timeout);
    this.Timeout = setTimeout(async ()=>{
      if(event.keyCode !== (32 || 13)){
        this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].observacion = this.viewMatrizHoraria.get('Observacion').value;
        this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].descripcion = this.viewMatrizHoraria.get('Descripcion').value;
        const transferObject: MatrizHorariaTransferObject = {
          codigo: this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].codigo,
          fechaCreacion: this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].fechaCreacion,
          descripcion: this.viewMatrizHoraria.get('Descripcion').value,
          observacion: this.viewMatrizHoraria.get('Observacion').value,
          estado: this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].estado
        }
        try{
          await this.ComponentService.updateMatrizHorariaDescripcion(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].id,transferObject);
          this.ComponentService.handleMessage("Datos Actualizados");
        }catch(error){
          this.ComponentService.handleError(error);
        }
        
      }
    },2000);
  }
  //--------------------------------------------------------------------------------------------------------------------
}

