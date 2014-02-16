/**
 * Copyright 2014 Smartificiel
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

/**
 * <h3>Simple BLE Device Explorer</h3>
 * <p>
 * Program that uses the Humble library to auto-explore nearby BLE devices and
 * display/convert their characteristics values.
 * </p>
 * <strong>Features:</strong>
 * <ul>
 * <li>list nearby BLE devices (after scanning during 5 seconds)</li>
 * <li>list device characteristics</li>
 * <li>auto config-read characteristics fro "sensor-like" devices</li>
 * </ul>
 * 
 * @author William ANGER <wanger+blexplore at smartificiel.com>
 */

var util = require('util');
var noble = require('noble');
var bleno = require('bleno');
var async = require('async');
var readline = require('readline');
var colors = require('colors');
var _ = require('underscore');

// Utility functions

/**
 * Convert value to fixed-length string.
 * 
 * @value {Any} the value to convert
 * @length {Integer} length of string to return
 * @blank_value {String} optional replacement string for blank or undefined
 *              values
 */
function l(value, length, blank_value) {
  if (value === undefined || value === "") {
    value = blank_value ? blank_value : "";
  }

  var whitespace_padding = "                                                       ";
  var str = value + "";

  if (str.length == length) {
    return str;
  }
  else {
    if (str.length < length) {
      return str + whitespace_padding.substr(0, length - str.length);
    }
    else {
      return str.substr(0, length - 4) + "...";
    }
  }
}

/**
 * Force value to be numeric or zero.
 * 
 * @param {Any}
 *          value
 * @returns {Number} an integer or float (or 0 if not a number)
 */
function num(value) {
  if (value == undefined || value == "") {
    return 0;
  }

  return value;
}

// Main program

function BleExplorer() {
  var self = this;

  //variables
  this.can_scan = false;

  // constructor
  this.main = function() {
  };

  // methods
  this.doScan = function(duration) {
    if (self.can_scan) {
      noble.removeListener('discover', self.onScanDiscover);
      noble.on('discover', self.onScanDiscover);

      noble.startScanning();

      // force scan stop after duration
      if (duration != undefined) {
        setTimeout(function() {
          noble.stopScanning();
        }, duration);
      }
    }
    else {
      console.log("Cannot scan (hardware not ready)!".red);
    }
  };

  };

  // event handlers
  this.onStateChange = function(state) {
    if (state === "poweredOn") {
      console.log("Bluetooth ready...");

      self.can_scan = true;
      self.doScan(5000);
    }
    else {
      console.log("Bluetooth not ready!".red);
      self.can_scan = false;
    }
  };

  this.onScanStart = function() {
    console.log("Scanning for BLE devices...\n".italic);

    //             15                18                   8          8
    console.log("| UUID            | Local Name         | Tx Power | Services".bold);
  };

  this.onScanStop = function() {
    console.log("Scanning for BLE devices stopped.".orange);
  };

  this.onScanDiscover = function(peripheral) {
    //console.log(peripheral);

    if (peripheral.advertisement) {
      var adv = peripheral.advertisement;
      console.log((
          "| " + l(peripheral.uuid, 15)
          + " | " + l(adv.localName, 18)
          + " | " + l(adv.TxPowerLevel, 8, '---')
          + " | " + adv.serviceUuids.length
          ).green);
    }
    else {
      console.log((
          "| " + l(dev.uuid, 15)
          + " | " + l("-none-", 18)
          + " | " + l("---", 8)
          + " | " + l("---", 8)
          ).yellow);
    }
  };


  // initialize bindings to noble events
  noble.on('scanStart', this.onScanStart);
  noble.on('stateChange', this.onStateChange);

  // construct and run this instance
  this.main();
}

// Run main program
var explorer = new BleExplorer();

// bind handlers to noble events

//  console.log('stopping scanning now');
//  noble.stopScanning();
/*
var advertisement = peripheral.advertisement;
console.log(JSON.stringify(advertisement));

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
}*/
//});
//if (localName == "Ti BLE Sensor Tag") {
//console.log("found SensorTag, trying to fetch temp value...");
//explore(peripheral);
//} else {
//  console.log("SensorTag not found");
//  process.exit(-1);
//}
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
                  }
                  else {
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
              }
              else {
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
