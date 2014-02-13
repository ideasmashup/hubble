var async = require('async');
var noble = require('noble');

var DEVICE_NAME = "SensorTag";

/* Humidity Service */
var UUID_HUMIDITY_SERVICE = "f000aa20-04514000b000000000000000";
var UUID_HUMIDITY_DATA_CHAR = "f000aa2104514000b000000000000000";
var UUID_HUMIDITY_CONFIG_CHAR = "f000aa2204514000b000000000000000";
/* Barometric Pressure Service */
var UUID_PRESSURE_SERVICE = "f000aa4004514000b000000000000000";
var UUID_PRESSURE_DATA_CHAR = "f000aa4104514000b000000000000000";
var UUID_PRESSURE_CONFIG_CHAR = "f000aa4204514000b000000000000000";
var UUID_PRESSURE_CAL_CHAR = "f000aa43-04514000b000000000000000";
/* Client Configuration Descriptor */
var UUID_CONFIG_DESCRIPTOR = "0000290200001000800000805f9b34fb";

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  console.log('peripheral with UUID ' + peripheral.uuid + ' found');

  console.log('stopping scanning now');
  noble.stopScanning();

  var advertisement = peripheral.advertisement;

  var localName = advertisement.localName;
  var txPowerLevel = advertisement.txPowerLevel;
  var manufacturerData = advertisement.manufacturerData;
  var serviceData = advertisement.serviceData;
  var serviceUuids = advertisement.serviceUuids;

  if (localName) {
    console.log('  Local Name        = ' + localName);
  }

  if (txPowerLevel) {
    console.log('  TX Power Level    = ' + txPowerLevel);
  }

  if (manufacturerData) {
    console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
  }

  if (serviceData) {
    console.log('  Service Data      = ' + serviceData);
  }

  if (localName) {
    console.log('  Service UUIDs     = ' + serviceUuids);
  }

  console.log();

  if (localName == "Ti BLE Sensor Tag") {
    console.log("found SensorTag, trying to fetch temp value...");
    explore(peripheral);
  } else {
    console.log("SensorTag not found");
  }
});

function explore(peripheral) {
  console.log('services and characteristics:');

  peripheral.on('disconnect', function() {
    process.exit(0);
  });

  peripheral.connect(function(error) {
    peripheral.discoverServices([], function(error, services) {
      var serviceIndex = 0;

      async.whilst(function() {
        return (serviceIndex < services.length);
      }, function(callback) {
        var service = services[serviceIndex];
        var serviceInfo = service.uuid;

        if (service.name) {
          serviceInfo += ' (' + service.name + ')';
        }
        console.log(serviceInfo);

        service.discoverCharacteristics([], function(error, characteristics) {
          var characteristicIndex = 0;

          async.whilst(function() {
            return (characteristicIndex < characteristics.length);
          }, function(callback) {
            var characteristic = characteristics[characteristicIndex];
            var characteristicInfo = '  ' + characteristic.uuid;

            if (characteristic.name) {
              characteristicInfo += ' (' + characteristic.name + ')';
            }

            async.series([ function(callback) {
              characteristic.discoverDescriptors(function(error, descriptors) {
                async.detect(descriptors, function(descriptor, callback) {
                  return callback(descriptor.uuid === '2901');
                }, function(userDescriptionDescriptor) {
                  if (userDescriptionDescriptor) {
                    userDescriptionDescriptor.readValue(function(error, data) {
                      characteristicInfo += ' (' + data.toString() + ')';
                      callback();
                    });
                  } else {
                    callback();
                  }
                });
              });
            }, function(callback) {
              characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

              if (characteristic.properties.indexOf('read') !== -1) {
                characteristic.read(function(error, data) {
                  if (data) {
                    var string = data.toString('ascii');

                    characteristicInfo += '\n    value       ' + data.toString('hex') + ' | \'' + string + '\'';
                  }
                  callback();
                });
              } else {
                callback();
              }
            }, function() {
              console.log(characteristicInfo);
              characteristicIndex++;
              callback();
            } ]);
          }, function(error) {
            serviceIndex++;
            callback();
          });
        });
      }, function(err) {
        peripheral.disconnect();
      });
    });
  });
}
