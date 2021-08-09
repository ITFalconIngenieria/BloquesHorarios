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
import { Validators } from '@angular/forms';

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
  MatrizHorariaData: Array<MatrizHorariaModel> = []
  MatrizHorariaKey: Number;
  BloqueHorarioData: Array<any> = []
  TableDataView: Array<TableViewModel> = []
  SelectDeleteHorarioView: Array<{Horario:String,Id:Number}> =[];
  SelectModifyHorarioView: Array<{Horario:String,Id: Number}> =[];
  SelectTags: Array<Number> = [];
  HoursList: Array<{Tag:String,Hour:Number}> = 
  [
    {Tag:"00",Hour:0},{Tag:"01",Hour:1},{Tag:"02",Hour:2},{Tag:"03",Hour:3},{Tag:"04",Hour:4},{Tag:"05",Hour:5},
    {Tag:"06",Hour:6},{Tag:"07",Hour:7},{Tag:"08",Hour:8},{Tag:"09",Hour:9},{Tag:"10",Hour:10},{Tag:"11",Hour:11},
    {Tag:"12",Hour:12},{Tag:"13",Hour:13},{Tag:"14",Hour:14},{Tag:"15",Hour:15},{Tag:"16",Hour:16},{Tag:"17",Hour:17},
    {Tag:"18",Hour:18},{Tag:"19",Hour:19},{Tag:"20",Hour:20},{Tag:"21",Hour:21},{Tag:"22",Hour:22},{Tag:"23",Hour:23}
  ]
  DisbleHoursList: Array<Array<Number>> = [[],[],[]];
  //---------------------------------------------------------------------------------------------------------------------

  //Select Value Variables-------------
  selectedDataTableViewIndex: Number = 0;
  selectedTotalHorasIndex: Number;
  selectedHorariosViewIndex: Number;
  selectedIdBloqueHorario: Number;
  selectMatrizHorariaIndex: Number = 0;
  selectedHorarioModifyId: Number;
  //------------------------------------

  //Visible Control Variables-----------------
  visibleMatrizHorariaForm: Boolean = false;
  visibleHorariosModal: Boolean = false;
  visibleHorariosDeleteModal: Boolean = false;

  visibleModifyHorarioModal: Boolean = false;
  //------------------------------------------

  //Loading Variables-------------------------
  loadingSelectData: Boolean = false;
  loadingTableData: Boolean = false;
  loadingPostingHorario: Boolean = false;
  loadingDeleteHorario: Boolean = false;
  loadingDeleteMatrizHoraria: Boolean = false;
  loadingPostMatrizHoraria: Boolean = false;

  loadingModifyHorarioModal: Boolean = false;
  //------------------------------------------

  //Form Group-----------------------
  viewMatrizHoraria = new FormGroup({
    Descripcion: new FormControl(''),
    Observacion: new FormControl(''),
  });
  matrizHorariaForm = new FormGroup({
    Codigo: new FormControl('',[
      Validators.required,
      Validators.minLength(1)]),
    Descripcion: new FormControl(''),
    Observacion: new FormControl('')
  });
  //---------------------------------
  
  async ngOnInit(): Promise<void>{ //Descartado de fallos
    this.loadingTableData = true;
    this.loadingSelectData = true;

    try {
      const { MHD,MHK,BHD,TDV,DHL} = await this.ComponentService.getInitialData();
      this.MatrizHorariaData = MHD;
      this.MatrizHorariaKey = MHK;
      this.BloqueHorarioData = BHD;
      this.TableDataView = TDV;
      this.DisbleHoursList = DHL;
      
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
    this.FinalTime= null;
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

  openModifyHorarioModal():void{
    this.visibleModifyHorarioModal = true;
    this.SelectModifyHorarioView = this.TableDataView[this.selectedDataTableViewIndex.valueOf()].Tiempo.Horarios[this.selectedHorariosViewIndex.valueOf()];
  }

  handleCancelModifyHorario(): void{
    this.visibleModifyHorarioModal = false;
    this.SelectModifyHorarioView=[];
    this.selectedHorarioModifyId = null;
    this.InitialTime = null;
    this.FinalTime = null;
  }
  //-------------------------------------------------------------------------------------------------------------------------------------------------------


  //HandleFunctions-----------------------------------------------------------------------------------------------------
  async handleOkModifyHorario(){
    if(this.ComponentService.handleHoursOverflow(this.TableDataView[this.selectedDataTableViewIndex.valueOf()],this.InitialTime,this.FinalTime)){
      this.ComponentService.handleMessageError("La cantidad excede las 24 horas por bloque, intente ingresar otro valor");
    }else{
      
    let InitialHour = new Date();
    let FinalHour = new Date();
    InitialHour.setHours(this.InitialTime.valueOf());
    InitialHour.setMinutes(0);
    InitialHour.setSeconds(0);
    InitialHour.setMilliseconds(0);
    FinalHour.setHours(this.FinalTime.valueOf());
    FinalHour.setMinutes(0);
    FinalHour.setSeconds(0);
    FinalHour.setMilliseconds(0);
    const _InitialHour = moment(InitialHour).toISOString(true);
    const _FinalHour = moment(FinalHour).toISOString(true);
    const hourFormat = moment(_InitialHour).format('HH')+ ' a ' + moment(_FinalHour).format('HH');

    const stringReturn = this.ComponentService.searchStringfromId(this.TableDataView[this.selectedDataTableViewIndex.valueOf()].Tiempo.Horarios[this.selectedHorariosViewIndex.valueOf()],this.selectedHorarioModifyId);
    const parseStringArray = this.ComponentService.parseHorarioString(' a ',stringReturn.Horario);
    const index1 = this.ComponentService.returnIndexDisableHours(this.DisbleHoursList[this.selectedDataTableViewIndex.valueOf()],parseStringArray[0]);
    const index2 = this.ComponentService.returnIndexDisableHours(this.DisbleHoursList[this.selectedDataTableViewIndex.valueOf()],parseStringArray[1]);

    this.DisbleHoursList[this.selectedDataTableViewIndex.valueOf()][index1] = this.InitialTime;
    this.DisbleHoursList[this.selectedDataTableViewIndex.valueOf()][index2]= this.FinalTime;
    this.TableDataView[this.selectedDataTableViewIndex.valueOf()].Tiempo.Horarios[this.selectedHorariosViewIndex.valueOf()][stringReturn.index.valueOf()].Horario = hourFormat;
    
    const newHorarioString = this.TableDataView[this.selectedDataTableViewIndex.valueOf()].Tiempo.HorarioString[this.selectedHorariosViewIndex.valueOf()].replace(stringReturn.Horario.toString(),hourFormat.toString());
    this.TableDataView[this.selectedDataTableViewIndex.valueOf()].Tiempo.HorarioString[this.selectedHorariosViewIndex.valueOf()] = newHorarioString;
    const transferObject: HorarioTransferObject = {
      bloqueHorarioId: this.selectedIdBloqueHorario,
      horaInicio: _InitialHour, 
      horaFinal: _FinalHour,
      estado: true
    }

    await this.ComponentService.putHorario(transferObject,this.selectedHorarioModifyId);
    const newTotalHoras = await this.ComponentService.updateTotalHoras(this.selectedIdBloqueHorario);
    this.TableDataView[this.selectedDataTableViewIndex.valueOf()]
        .Tiempo
        .TotalHoras[this.selectedTotalHorasIndex.valueOf()] = newTotalHoras;
    

    }
    this.SelectModifyHorarioView=[];
    this.selectedHorarioModifyId = null;
    this.InitialTime = null;
    this.FinalTime = null;
    this.visibleModifyHorarioModal = false;
  }

  handleSaveDataInVariables(arrayIndex: Number,totalHorasIndex: Number, horariosIndex : Number,idBloqueHorario: Number){
    this.selectedDataTableViewIndex = arrayIndex;
    this.selectedTotalHorasIndex = totalHorasIndex;
    this.selectedHorariosViewIndex = horariosIndex;
    this.selectedIdBloqueHorario = idBloqueHorario;
  }

  async handleOkDeleteHorarios(){
    this.loadingDeleteHorario = true;
    const {TDV,DHL} = await this.ComponentService.deleteHorarios(this.TableDataView[this.selectedDataTableViewIndex.valueOf()],this.SelectTags);
    this.TableDataView[this.selectedDataTableViewIndex.valueOf()] = TDV;
    this.DisbleHoursList[this.selectedDataTableViewIndex.valueOf()]= DHL;
    this.loadingDeleteHorario = false;
    this.visibleHorariosDeleteModal = false;
    this.SelectTags=[];
  }
  
  async handleChangeMatrizHorariaSelect():Promise<void>{ //Posible fallo aqui
    this.loadingTableData = true;
    this.loadingSelectData = true;
    this.viewMatrizHoraria.get('Observacion').setValue('');
    this.viewMatrizHoraria.get('Descripcion').setValue('');

    try{
    
    const { MHD,BHD,TDV,DHL } = await this.ComponentService.updateMatrizHoraria(this.MatrizHorariaKey);
    this.MatrizHorariaData = MHD;
    this.BloqueHorarioData = BHD;
    this.TableDataView = TDV;
    this.DisbleHoursList = DHL;
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

  const { MHD,MHK,BHD,TDV,DHL } = await this.ComponentService.getInitialData();
  this.MatrizHorariaData = MHD;
  this.MatrizHorariaKey = MHK;
  this.BloqueHorarioData = BHD;
  this.TableDataView = TDV;
  this.DisbleHoursList = DHL;
  
  this.viewMatrizHoraria.get('Observacion').setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].observacion);
  this.viewMatrizHoraria.get('Descripcion').setValue(this.MatrizHorariaData[this.selectMatrizHorariaIndex.valueOf()].descripcion);
  
  this.loadingDeleteMatrizHoraria = false;
  this.loadingSelectData = false;
  this.loadingTableData = false;
  }

  async handleOkMatrizHorariaForm(): Promise<void>{
    this.loadingPostMatrizHoraria = true;
    let _date = moment(new Date()).toISOString(true);
    let bodyObject: MatrizHorariaTransferObject = {
      codigo: this.matrizHorariaForm.get('Codigo').value,
      descripcion: this.matrizHorariaForm.get('Descripcion').value,
      observacion: this.matrizHorariaForm.get('Observacion').value,
      estado: true,
      fechaCreacion: _date
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
  if(this.ComponentService.handleHoursOverflow(this.TableDataView[this.selectedDataTableViewIndex.valueOf()],this.InitialTime,this.FinalTime)){
    this.ComponentService.handleMessageError("La cantidad excede las 24 horas por bloque, intente ingresar otro valor");
  }else{
    
  
    let InitialHour = new Date();
    let FinalHour = new Date();
    InitialHour.setHours(this.InitialTime.valueOf());
    InitialHour.setMinutes(0);
    InitialHour.setSeconds(0);
    InitialHour.setMilliseconds(0);
    FinalHour.setHours(this.FinalTime.valueOf());
    FinalHour.setMinutes(0);
    FinalHour.setSeconds(0);
    FinalHour.setMilliseconds(0);
    const _InitialHour = moment(InitialHour).toISOString(true);
    const _FinalHour = moment(FinalHour).toISOString(true); 
  
    const transferObject: HorarioTransferObject = {
      bloqueHorarioId: this.selectedIdBloqueHorario,
      horaInicio: _InitialHour, 
      horaFinal: _FinalHour,
      estado: true
    }
    const IdHorario = await this.ComponentService.postHorario(transferObject);
    
    const {TDV,DHL} = this.ComponentService.updateTableData(
      this.TableDataView,
      this.selectedIdBloqueHorario,
      this.selectedDataTableViewIndex,
      this.selectedHorariosViewIndex,
      this.selectedTotalHorasIndex,
      _InitialHour,
      _FinalHour,
      IdHorario,
      this.DisbleHoursList[this.selectedDataTableViewIndex.valueOf()]
    );
    
    this.TableDataView = TDV;
    this.DisbleHoursList[this.selectedDataTableViewIndex.valueOf()] = DHL;
  }
  this.loadingPostingHorario = false;
  this.visibleHorariosModal = false;
  this.InitialTime=null;
  this.FinalTime=null;
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

  handleDisableOption(value: Number):Boolean{
    return this.DisbleHoursList[this.selectedDataTableViewIndex.valueOf()].indexOf(value)!==-1
  }
  //--------------------------------------------------------------------------------------------------------------------
}

