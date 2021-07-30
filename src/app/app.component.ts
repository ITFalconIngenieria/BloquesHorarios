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
  //Arreglos---------------
    MatrizHorariaData: MatrizHorariaModel[] = []
    MatrizHorariaKey: Number;
    BloqueHorarioData: any[]= []
    TableDataView: TableViewModel[] = []
  //ViewTable--------------
  //-----------------------
  selectedDataTableViewIndex: number;
  selectedTotalHorasIndex: number;
  selectedHorariosViewIndex: number;
  selectedIdBloqueHorario: number;

  //-----------------------
  visibleMatrizHorariaForm: Boolean = false;
  visibleHorariosModal: Boolean = false;
  //-----------------------

  //Loading Variables------
  loadingSelectData: Boolean = false;
  loadingTableData: Boolean = false;
  loadingPostingHorario: Boolean = false;
  //-----------------------

  //FormControls-----------
  observacion = new FormControl('');
  matrizHorariaForm = new FormGroup({
    Codigo: new FormControl(''),
    Descripcion: new FormControl(''),
    Observacion: new FormControl('')
  });
  //-----------------------


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
        fechaCreacion: moment.tz('America/Tegucigalpa').toISOString()
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

  //Hadle Modal-----------------------
  async handleOkModalHorarios(){
    this.loadingPostingHorario = true;
    const InitialHour = this.InitialTime.toISOString()
    const FinalHour = this.FinalTime.toISOString()

    const transferObject: HorarioTransferObject = {
      bloqueHorarioId: this.selectedIdBloqueHorario,
      horaInicio: InitialHour, 
      horaFinal: FinalHour,
      estado: true
    }

    await this.ComponentService.postHorario(transferObject);
    const tableDataUpdated = await this.ComponentService.updateTableData(
      this.TableDataView,
      this.selectedIdBloqueHorario,
      this.selectedDataTableViewIndex,
      this.selectedHorariosViewIndex,
      this.selectedTotalHorasIndex
    );

    this.loadingPostingHorario = false;
    this.visibleHorariosModal = false;
  }


  handleCancelModalHorarios(){
    this.visibleHorariosModal = false;
  }

  //----------------------------------
  handleSaveDataInVariables(arrayIndex: number,totalHorasIndex: number, horariosIndex : number,idBloqueHorario: number){
    this.selectedDataTableViewIndex = arrayIndex;
    this.selectedTotalHorasIndex = totalHorasIndex;
    this.selectedHorariosViewIndex = horariosIndex;
    this.selectedIdBloqueHorario = idBloqueHorario;

    console.log({
      arrayIndex,
      totalHorasIndex,
      horariosIndex,
      idBloqueHorario
    })
  }

  openHorarioModal(){
    this.visibleHorariosModal = true;
    console.log({
      IdBloque: this.selectedIdBloqueHorario,
      Horarios: this.TableDataView[this.selectedDataTableViewIndex].Tiempo.Horarios[this.selectedHorariosViewIndex],
      TotalHoras: this.TableDataView[this.selectedDataTableViewIndex].Tiempo.TotalHoras[this.selectedTotalHorasIndex]
    })
  }

  //----------------------------------
}

