var noble = require('noble');

noble.on('stateChange', function(state) {
  console.log('state changed to : ' + state);
  if (state === 'poweredOn') {
    console.log('scanning started...');
    noble.startScanning();
  } else {
    console.log('scanning stopped...');
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  console.log('peripheral discovered (' + peripheral.uuid + '):');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));
  if (peripheral.advertisement.serviceData) {
    console.log('\there is my service data:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceData.toString('hex')));
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:');
    console.log('\t\t' + peripheral.advertisement.txPowerLevel);
  }

  peripheral.on('connect', function() {
    console.log('connected');

    var serviceUUIDs = [ 'ffe2' ];
    peripheral.discoverServices(serviceUUIDs, function(error, services) {
      console.log('err = ' + error);
      console.log('services = ' + services);
    });

    console.log(1);

    peripheral.discoverAllServicesAndCharacteristics(function(error, services, characts) {
      console.log('err = ' + error);
      console.log('services = ' + services);
      console.log('characts = ' + characts);

      for ( var i = 0; i < characts.length; i++) {
        characts[i].read(function(error, data) {
          console.log('read chara[' + i + '] : ' + JSON.stringify(data));
        });
      }
    });

    console.log(2);
  });

  peripheral.on('serviceDiscover', function(services) {
    console.log('discovered services :');
    console.log(services);
  });

  peripheral.connect(function(error) {
    if (!error) {

    } else {

    }
    console.log('error connect = ' + error);
  });

  console.log();
});
