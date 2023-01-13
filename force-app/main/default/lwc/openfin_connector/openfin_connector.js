import openfinSalesforceLwc from '@salesforce/resourceUrl/openfin_salesforce_lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { LightningElement, api, track, wire} from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import OWNER_NAME_FIELD from '@salesforce/schema/Account.Owner.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

export default class MyComponent extends LightningElement {


    @api objectApiName;
    @api recordId;
    @track currenObjectName;
    @track currenRecordId;

    dataLoaded = false;
    account;
    name;
    phone;
    industry;
    owner;

    @track columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Id', fieldName: 'Id'}
    ];

    @track accountList;
    @track currentAccount;
     
    @wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD, INDUSTRY_FIELD], optionalFields: [PHONE_FIELD, OWNER_NAME_FIELD] })
    wiredRecord({ error, data }) {
        this.dataLoaded = false;
        if (error) {
            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading account',
                    message,
                    variant: 'error',
                }),
            );
        } else if (data) {
            this.dataLoaded = true;
            console.log('account Data', JSON.stringify(data, null, 2));
            this.account = data;
            this.name = this.account.fields.Name.value;
            this.phone = this.account.fields.Phone.value;
            this.owner = this.account.fields.Owner.value.fields.Name.value;
            this.industry = this.account.fields.Industry.value;

            const event = {
                target: {
                    dataset: {
                        ctxtype: 'interop'
                    }
                }
            }
            this.buttonClicked(event);
        }
    }

    //  get name() {
    //     return getFieldValue(this.account.data, NAME_FIELD);
    // }

    // get phone() {
    //     return getFieldValue(this.account.data, PHONE_FIELD);
    // }

    
    // get industry(){
    //     return getFieldValue(this.account.data, INDUSTRY_FIELD);
    // }
    
    // get owner() {
    //     return getFieldValue(this.account.data, OWNER_NAME_FIELD);
    // }

    // constructor() {
    //     super();    
    //     this.addEventListener('click', () => {
    //         console.log('openFin - Component Clicked: ');
    //         console.log('currentRecordId: ' + this.recordId);
    //         console.log('currenObjectName: ' + this.objectApiName);
    //         // console.dir(window.fin.salesforce); 
    //         });
    //   }

    setOpenFinContextWithInterop = async (accountObj) => {
        const context = {
            "type": "fdc3.instrument",
            "name": "Tesla Test Deepak",
            "id": {
                "ticker": "TSLA",
                "ISIN": "usb8160R1014"
            },
            "sfObject": {
                "recordId": this.recordId,
                "objectAPIName": this.objectApiName,
                "accountName": this.name,
                "phone": this.phone,
                "owner": this.owner
            }
        };
        window.fin.me.interop.setContext(context);
    }

    setOpenFinContextWithFdc3 = async (accountObj) => {
        if (window.fdc3 !== undefined) {
            const context = {
                "type": "fdc3.instrument",
                "name": "Tesla Test Deepak",
                "id": {
                    "ticker": "TSLA",
                    "ISIN": "usb8160R1014"
                },
                "sfObject": {
                    "recordId": this.recordId,
                    "objectAPIName": this.objectApiName
                }
            };

            const systemChennel = await window.fdc3.getCurrentChannel();

            if (systemChennel) {
                console.log('BROADCASTING ON ' + systemChennel.type + ' channel: ' + systemChennel.id, context);
            } else {
                console.log('You are not bound to a system channel');
            }


        } else {
            console.warn('window.fdc3 is Undefined');
        }
    }

    buttonClicked(event) {

        if (event.target && event.target.dataset && event.target.dataset.ctxtype) {
            console.log('openFin - Button Clicked  : ');
            console.log('currentRecordId: ' + this.recordId);
            console.log('currenObjectName: ' + this.objectApiName);
    
            const accountObj = { recordId: this.recordId, objectApiName: this.objectApiName };
    
            console.log('ctxType:', event.target.dataset.ctxtype);
    
            if (event.target.dataset.ctxtype === 'interop') {
                this.setOpenFinContextWithInterop(accountObj);    
            } else {
                this.setOpenFinContextWithFdc3(accountObj);
            }
        }

    }
  async connectedCallback() {

    this.currenRecordId = this.recordId;
    this.currenObjectName = this.objectApiName;

    try {
        console.log('OpenFin: Calling loadScript');
      await loadScript(this, openfinSalesforceLwc);
    } catch (err) {
      console.warn('OpenFin: Failed to load static resource, has it been added in Salesforce org settings?');
      return;
    }

    // Initialize OpenFin APIs for use
    window.fin.salesforce.initFinApiInLwc();

    // Output the current OpenFin runtime info to the console
    console.log(await window.fin.System.getRuntimeInfo());
  }



}