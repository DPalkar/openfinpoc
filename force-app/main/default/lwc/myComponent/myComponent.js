import openfinSalesforceLwc from '@salesforce/resourceUrl/openfin_salesforce_lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { LightningElement } from 'lwc';

export default class MyComponent extends LightningElement {

  greeting = 'World';
  changeHandler(event) {
    this.greeting = event.target.value;
  }
  
  async connectedCallback() {
    try {
      await loadScript(this, openfinSalesforceLwc);
    } catch (err) {
      console.warn('Failed to load static resource, has it been added in Salesforce org settings?');
      return;
    }

    // Initialize OpenFin APIs for use
    window.fin.salesforce.initFinApiInLwc();

    // Output the current OpenFin runtime info to the console
    console.log(await window.fin.System.getRuntimeInfo());
  }  


}