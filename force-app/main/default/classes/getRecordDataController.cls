public with sharing class getRecordDataController {
    //@AuraEnabled is annotation enables LWC to access below apex method
    //(cacheable=true) is for caching the data on client side storage without 
    //  waiting for server trips. Which imporves the performance
    @AuraEnabled(cacheable=true)
     public static List<Account> getAccounts() {
     return [SELECT Id, Name, Phone FROM Account];
     }
}