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

var noble = require('noble');
var bleno = require('bleno');
var async = require('async');
var readline = require('readline');
var colors = require('colors');
var _ = require('underscore');

// Helpers and utilities for BLE

// FIXME move to an external module (to be published on GitHub)

var TYPES = {
  // Reserved for future use
  'rfu' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([value]);
    }
  },
  // unsigned 16-bit integer or unsigned 128-bit integer
  'gatt_uuid' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 1-bit; 0 = false, 1 = true
  'boolean' : {
    'read' : function(data) {
      return (data.toString('hex') == '1');
    },
    'buffer' : function(value) {
      return new Buffer([value ? 0x01 : 0x00]);
    }
  },
  // 2-bit value
  '2bit' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // 4-bit value
  'nibble' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // 8-bit value
  '8bit' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // 16-bit value
  '16bit' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // 24-bit value
  '24bit' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // 32-bit value
  '32bit' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 8-bit integer
  'uint8' : {
    'read' : function(data) {
      return data.readUInt8();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 12-bit integer
  'uint12' : {
    'read' : function(data) {
      // FIXME implement bit-wise shifting to convert to unsigned value?
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 16-bit integer
  'uint16' : {
    'read' : function(data) {
      return data.readUInt16LE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 24-bit integer
  'uint24' : {
    'read' : function(data) {
      // FIXME implement bit-wise shifting to convert to unsigned value?
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 32-bit integer
  'uint32' : {
    'read' : function(data) {
      return data.readUInt32LE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 40-bit integer
  'uint40' : {
    'read' : function(data) {
      // FIXME implement bit-wise shifting to convert to unsigned value?
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 48-bit integer
  'uint48' : {
    'read' : function(data) {
      // FIXME implement bit-wise shifting to convert to unsigned value?
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 64-bit integer
  'uint64' : {
    'read' : function(data) {
      // FIXME implement bit-wise shifting to convert to unsigned value?
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // unsigned 128-bit integer
  'uint128' : {
    'read' : function(data) {
      // FIXME implement bit-wise shifting to convert to unsigned value?
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // signed 8-bit integer
  'sint8' : {
    'read' : function(data) {
      return data.readInt8();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // signed 12-bit integer
  'sint12' : {
    'read' : function(data) {
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // signed 16-bit integer
  'sint16' : {
    'read' : function(data) {
      return data.readInt16LE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // signed 24-bit integer
  'sint24' : {
    'read' : function(data) {
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // signed 32-bit integer
  'sint32' : {
    'read' : function(data) {
      return data.readInt32LE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // signed 48-bit integer
  'sint48' : {
    'read' : function(data) {
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // signed 64-bit integer
  'sint64' : {
    'read' : function(data) {
      return parseInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // signed 128-bit integer
  'sint128' : {
    'read' : function(data) {
      return pasreInt(data.toString('hex'), 16);
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // IEEE-754 32-bit floating point
  'float32' : {
    'read' : function(data) {
      return data.readFloatLE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // IEEE-754 64-bit floating point
  'float64' : {
    'read' : function(data) {
      return data.readFloatLE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // IEEE-11073 16-bit SFLOAT
  'SFLOAT' : {
    'read' : function(data) {
      return data.readFloatLE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // IEEE-11073 32-bit FLOAT
  'FLOAT' : {
    'read' : function(data) {
      return data.readFloatLE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // double unsigned 16-bit integer
  'dunit16' : {
    'read' : function(data) {
      return data.readDoubleLE();
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // UTF-8 string
  'utf8s' : {
    'read' : function(data) {
      return data.toString('utf8');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // UTF-16 string
  'utf16s' : {
    'read' : function(data) {
      return data.toString('utf16le');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // Regulatory Certification Data List - Refer to IEEE 11073-20601 Regulatory Certification Data List characteristic
  'reg-cert-data-list' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // Defined by the Service Specification
  'variable' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  },
  // Example: uint8[]
  'Array[]' : {
    'read' : function(data) {
      return data.toString('hex');
    },
    'buffer' : function(value) {
      return new Buffer([parseInt(value, 16)]);
    }
  }
};

/**
 * Read value from Buffer.
 * @param type
 * @param data
 */
function readValue(type, data) {
  if (_.has(type, TYPES)) {
    return TYPES[type].read(data);
  }
  else {
    return data.toString('hex');
  }
}

/**
 * Make new Buffer with provided type and value data.
 * @param type
 * @param value
 */
function bufferValue(type, value) {
  if (_.has(type, TYPES)) {
    return TYPES[type].buffer(value);
  }
  else {
    return new Buffer([parseInt(value, 16)]);
  }
}

// Formatting functions

/**
 * Convert value to fixed-length string.
 *
 * @value {Any} the value to convert
 * @length {Integer} length of string to return
 * @blank_value {String} optional replacement string for blank or undefined
 *              values
 */
function l(value, length, blank_value) {
  if (value === undefined || value === null || value === "") {
    value = blank_value ? blank_value : "";
  }

  // force conversion to string and sanitizing of values (to avoid ASCII breaks with non-displayable chars)
  var whitespace_padding = "                                                       ";
  var str = clean(value + "");

  if (str.length == length) {
    return str;
  }
  else {
    if (str.length < length) {
      return str + whitespace_padding.substr(0, length - str.length);
    }
    else {
      return str.substr(0, length - 3) + "...";
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

/**
 * Remove non-displayable chars from string
 * @param str
 */
function clean(str) {
  return str.replace(/[^A-Za-z_ 0-9+-\\\/.,"#'~&$£*%:€()\[\]@°=\{\}ø?!<>²³]+/, '');
};

// Main program

function BleExplorer() {
  var self = this;

  //variables
  this.can_scan = false;
  this.devices = [];

  this.current_device = null;

  // constructor
  this.main = function() {
    console.log("\n    ,-.".green.bold);
    console.log("   / \\  `.  __..-,O".green.bold);
    console.log("  :   \\ --''_..-'.'".green.bold);
    console.log("  |    . .-' `. '.".green.bold);
    console.log("  :     .     .`.'".green.bold);
    console.log("   \     `.  /  ..   ".green.bold +"-----------------------".cyan);
    console.log("    \      `.   ' .  ".green.bold +"     BLE Explorer v0.1 ".cyan);
    console.log("     `,       `.   \\".green.bold +"   --------------------".cyan);
    console.log("    ,|,`.        `-.\\".green.bold +"      for Node + Noble".green);
    console.log("   '.||  ``-...__..-`".green.bold);
    console.log("    |  |".green.bold);
    console.log("    |__|".green.bold);
    console.log("    /||\\ ".green.bold);
    console.log("   //||\\\\".green.bold);
    console.log("  // || \\\\".green.bold);
    console.log("_//__||__\\\\__".green.bold);
    console.log("'--------------'".green.bold + " ProTip®:".green.bold + " type EXIT or BACK to navigate between screens and HELP for hints\n".green);
  };

  // methods
  this.doScan = function(duration) {
    if (duration == undefined) {
      duration = 1000;
    }

    if (self.can_scan) {
      // clear devices array
      self.devices = [];

      // clear listeners
      noble.removeListener('discover', self.onScanDiscover);
      noble.on('discover', self.onScanDiscover);

      noble.startScanning();

      // force scan stop after duration
      setTimeout(function() {
        noble.stopScanning();
        self.doSelectDevice();
      }, duration);
    }
    else {
      console.log("Cannot scan (hardware not ready)!".red);
    }
  };

  this.doExploreDevice = function(device) {
    if (self.current_device == null) {
      // not connected to a device, need to connect before being able to list services
      device.connect(function(error) {
        // store current device ref
        self.current_device = device;

        device.discoverServices([], function(error, services) {
          var serviceIndex = 0;

          // clear device services (create new array into device object)
          device.services = [];

          console.log("\nConnected to BLE peripheral, exploring services...\n".italic);

          //             2    32                                 32                                 64
          console.log("| #  | Service Handle (UUID)            | GATT Name                        | Type                                                           ".bold);

          async.whilst(function() {
            return (serviceIndex < services.length);
          }, function(callback) {
            var service = services[serviceIndex];

            // append service into device array
            device.services.push(service);
            service.index = device.services.length - 1;
            serviceIndex++;

            if (service.name) {
              // standard Bluetooth 4.0 Approved service UUID
              console.log((
                  "| " + l(device.services.length - 1, 2)
                  + " | " + l(service.uuid, 32)
                  + " | " + l(service.name, 32, '---')
                  + " | " + l(service.type, 64, '---')
                  ).green.bold);
            }
            else {
              // non-standard service UUID
              console.log((
                  "| " + l(device.services.length - 1, 2)
                  + " | " + l(service.uuid, 32)
                  + " | " + l('---', 32)
                  + " | " + l(service.type, 64, '---')
                  ).cyan.bold);
            }

            // continue to next async item
            callback();

          }, function(err) {
            if (err) {
              // disconnect if error
              self.doDisconnectDevice(device);
            }
            else {
              // done exploring services (no error happened)
              setTimeout(function(){
                self.doSelectService(device);
              }, 1000);
            }
          });
        });
      });
    }
    else {
      // connected already, show list of already saved services

      console.log("\nStill connected to BLE peripheral, showing listed services...\n".italic);

      //    2    32                                 32                                 64
      console.log("| #  | Service Handle (UUID)            | GATT Name                        | Type                                                           ".bold);

      for (var i = 0; i < device.services.length; i++) {
        var service = device.services[i];

        if (service.name) {
          // standard Bluetooth 4.0 Approved service UUID
          console.log((
              "| " + l(device.services.length - 1, 2)
              + " | " + l(service.uuid, 32)
              + " | " + l(service.name, 32, '---')
              + " | " + l(service.type, 64, '---')
              ).green.bold);
        }
        else {
          // non-standard service UUID
          console.log((
              "| " + l(device.services.length - 1, 2)
              + " | " + l(service.uuid, 32)
              + " | " + l('---', 32)
              + " | " + l(service.type, 64, '---')
              ).cyan.bold);
        }
      }

      // done listing services again
      setTimeout(function(){
        self.doSelectService(device);
      }, 1000);
    }
  };

  this.doDisconnectDevice = function(device) {
    if (device == undefined) {
      device = self.current_device;
    }

    if (device != null) {
      self.current_device = null;
      device.disconnect();
      console.log("Disconnected from BLE device...\n".magenta);
    }
    else {
      console.log("Already disconnected from device");
    }
  };

  this.doSelectService = function(device) {
    if (device.services.length > 0) {

      var rl = readline.createInterface({
        input : process.stdin,
        output : process.stdout
      });


      rl.question("\nType # of the service to explore and press Enter:", function(id) {
        rl.close();

        if (id.toUpperCase() == 'EXIT') {
          self.doDisconnectDevice(device);

          // must wait for disconnect to finish before exiting (BLE is SLOW)
          setTimeout(function() {
            process.exit(-1);
          }, 2000);
        }
        else if (id.toUpperCase() == 'BACK') {
          self.doDisconnectDevice(device);

          // must wait before scanning again (BLE disconnection is SLOW!!)
          setTimeout(self.doScan, 2500);
        }
        else if (_.isNumber(id*1) && id >= 0 && id < device.services.length) {
          console.log("Selected "+ id +" ("+ device.services[id].uuid +")");
          self.doExploreCharacteristics(device, device.services[id]);
        }
        else {
          if (device.services.length > 1) {
            console.log(("You must enter a value between '0' and '"+ device.services.length +"'!").red);
            setTimeout(function(){
              self.doSelectService(device);
            }, 1000);
          }
          else {
            console.log("Only one service found, you can only select the service '0'".yellow);
            setTimeout(function(){
              self.doSelectService(device);
            }, 1000);
          }
        }
      });
    }
    else {
      console.log("Couln't find any services on this BLE peripheral!".red);
      setTimeout(self.doScan, 1000);
    }
  };

  this.doExploreCharacteristics = function(device, service) {
    service.discoverCharacteristics([], function(error, characteristics) {
      var characteristicIndex = 0;

      // clear service characteristics (create new array into service object)
      service.characteristics = [];

      console.log("\nExploring service characteristics...\n".italic);

      //             2    32                                 50                                                   64
      console.log("| #  | Characteristic Handle (UUID)     | GATT Name / Display Name                           | Type                                                            ".bold);
      console.log("     | Properties                       | Value (hexadecimal)                                | Value (ascii)                                ");
      console.log("     | Descriptors (if any)".grey.bold);

      async.whilst(function() {
        return (characteristicIndex < characteristics.length);
      }, function(callback) {
        var characteristic = characteristics[characteristicIndex];
        var properties = "", ascii = "", value = "", name = "";

        // append characteristic into service array
        service.characteristics.push(characteristic);
        characteristic.index = service.characteristics.length - 1;
        characteristicIndex++;

        if (characteristic.name) {
          name = characteristic.name;
        }

        async.series([ function(callback) {
          characteristic.discoverDescriptors(function(error, descriptors) {
            characteristic.descriptors = descriptors;
            async.detect(descriptors, function(descriptor, callback) {
              // 2901: "User Description" (org.bluetooth.descriptor.gatt.characteristic_user_description)
              return callback(descriptor.uuid === '2901');
            }, function(userDescriptionDescriptor) {
              if (userDescriptionDescriptor) {
                userDescriptionDescriptor.readValue(function(error, data) {
                  name = data.toString();
                  callback();
                });
              }
              else {
                callback();
              }
            });
          });
        }, function(callback) {
          properties = characteristic.properties.join(', ');

          if (characteristic.properties.indexOf('read') !== -1) {
            characteristic.read(function(error, data) {
              if (data) {
                var string = data.toString('ascii');
                value = data.toString('hex');
                ascii = string;
              }
              callback();
            });
          }
          else {
            callback();
          }
        }, function() {
          // primary characteristic infos and details
          if (characteristic.name) {
            // standard Bluetooth 4.0 Approved service UUID

            // primary infos
            console.log((
                "| " + l(service.characteristics.length - 1, 2)
                + " | " + l(characteristic.uuid, 32)
                + " | " + l(name, 50, '---')
                + " | " + l(characteristic.type, 64, '---')
                ).green.bold);

            // details
            console.log((
                "     | " + l(properties, 32)
                + " | " + l(value, 50, '---')
                + " | " + l(ascii, 64, '---')
                ).green);

            // descriptors
            if (characteristic.descriptors && characteristic.descriptors.length > 0) {
              var list = [];
              _.each(characteristic.descriptors, function(element, index){
                list.push(element.name);
              });
              console.log(("     | " + list.join(", ")).grey.bold);
            }

          }
          else {
            // non-standard characteristic UUID

            // primary infos
            console.log((
                "| " + l(service.characteristics.length - 1, 2)
                + " | " + l(characteristic.uuid, 32)
                + " | " + l(name, 50)
                + " | " + l(characteristic.type, 64, '---')
                ).cyan.bold);

            // details
            console.log((
                "     | " + l(properties, 32)
                + " | " + l(value, 50, '---')
                + " | " + l(ascii, 64, '---')
                ).cyan);

            // descriptors
            if (characteristic.descriptors && characteristic.descriptors.length > 0) {
              var list = [];
              _.each(characteristic.descriptors, function(element, index){
                list.push(element.name);
              });
              console.log(("     | " + list.join(", ")).grey);
            }
          }
          callback();
        } ]);
      }, function(error) {
        if (error) {
          // error happened... ignore it?
          console.warn(error);
        }
        else {
         // finished listing this service's characteristics (no error happened)
          setTimeout(function() {
            self.doSelectCharacteristic(device, service);
          }, 1000);
        }
      });
    });
  };

  this.doSelectCharacteristic = function(device, service) {
    if (service.characteristics.length > 0) {

      var query_pattern = /^(\d+) (READ|WRITE) ?([A-Za-z0-9-_]+)? ?(.*)?$/;
      var query_matches;

      var rl = readline.createInterface({
        input : process.stdin,
        output : process.stdout
      });

      rl.question("\nType # of the characteristic, action and value to query (see HELP) then press Enter:", function(query) {
        rl.close();

        // validate provided query
        query_matches = query.match(query_pattern);

        if (query.toUpperCase() == 'EXIT') {
          self.doDisconnectDevice(device);

          // must wait for disconnect to finish before exiting (BLE is SLOW)
          setTimeout(function() {
            process.exit(-1);
          }, 2000);
        }
        else if (query.toUpperCase() == 'BACK') {
          // go back to service selection prompt
          setTimeout(function(){
            self.doSelectService(device);
          }, 1000);
        }
        else if (query.toUpperCase() == 'HELP') {
          console.log("\nQuery format : [index] [action]( [format])( [\"value\"])\n".bold.magenta);

          console.log("  [index]".bold.magenta + "  # number of the characteristic to query".magenta);
          console.log("  [action]".bold.magenta + " either 'read' or 'write'".magenta);
          console.log("  [format]".bold.magenta + " optionnal data type (utf8, uint8, )");
          console.log("  [value]".bold.magenta + "  optionnal value for 'write' requests\n".magenta);

          console.log("Examples : ".magenta + "2 READ".magenta.bold + ", ".magenta + "42 READ UInt32\"is_the_answer\"".magenta.bold + ", ".magenta + "42 WRITE \"is_the_answer\"".magenta.bold);

          setTimeout(function(){
            self.doSelectCharacteristic(device, service);
          }, 2000);
        }
        else if (query_matches != null) {
          // query seems correct, we can now attempt to parse it
          var index = parseInt(query_matches[1]);
          var action = query_matches[2];
          var type = query_matches[3];
          var value = query_matches[4];

          if (!type) {
            // default to hexadecimal read/write
            type = 'hex';
          }

          if (index >= 0 && index < service.characteristics.length) {
            // correct characteristic index
            if (action.toUpperCase() == 'READ') {
              console.log("\nReading characteristic ".magenta + service.characteristics[index].uuid.magenta);
              service.characteristics[index].read(function(error, data){
                if (error) {
                  // error while reading
                  console.log("Couldn't read value! Error: ".red + error);

                  setTimeout(function(){
                    self.doSelectCharacteristic(device, service);
                  }, 2000);
                }
                else {
                  // read value from buffer successful
                  console.log("Read value : ".magenta.bold + readValue(type, data));

                  setTimeout(function(){
                    self.doSelectCharacteristic(device, service);
                  }, 2000);
                }
              });
            }
            else if (action.toUpperCase() == 'WRITE') {
              if (value) {
                var buffer = bufferValue(type, value);
                var notify = true;

                console.log("\nWriting ".magenta + value.magenta + " into characteristic ".magenta + service.characteristics[index].uuid.magenta);
                service.characteristics[index].write(buffer, notify, function(error) {
                  if (error) {
                    // error while writing
                    console.log("Error while writing: ".red + error);

                    setTimeout(function(){
                      self.doSelectCharacteristic(device, service);
                    }, 2000);
                  }
                  else {
                    // successful write
                    console.log("Wrote value : ".magenta.bold + "0x" + buffer.toString('hex'));
                    setTimeout(function(){
                      self.doSelectCharacteristic(device, service);
                    }, 2000);
                  }
                });
              }
              else {
                console.log("You must provide a value when using the 'WRITE' action!".red);

                setTimeout(function(){
                  self.doSelectCharacteristic(device, service);
                }, 2000);
              }
            }
            else {
              console.log("You must provide a valid action (either READ or WRITE)! Provided action "+ action +" is incorrect!".red);

              setTimeout(function(){
                self.doSelectCharacteristic(device, service);
              }, 2000);
            }
          }
          else {
            // incorrect characteristic index
            if (service.characteristics.length > 1) {
              console.log(("You must enter an index between '0' and '"+ service.characteristics.length +"'! Provided index "+ index +" is incorrect!").red);

              setTimeout(function(){
                self.doSelectCharacteristic(device, service);
              }, 2000);
            }
            else {
              console.log("Only one characteristic found, you can only use the index '0'".yellow);

              setTimeout(function(){
                self.doSelectCharacteristic(device, service);
              }, 2000);
            }
          }
        }
        else {
          console.log("Your query is invalid, please check the allowed format by typing 'HELP' then Enter.".red);

          setTimeout(function(){
            self.doSelectCharacteristic(device, service);
          }, 2000);
        }
      });
    }
    else {
      console.log("Couln't find any characteristic in this service!".red);
      process.exit(-1);
    }
  };

  this.doSelectDevice = function() {
    if (self.devices.length > 0) {

      var rl = readline.createInterface({
        input : process.stdin,
        output : process.stdout
      });

      rl.question("\nType # of the device to explore and press Enter:", function(id) {
        rl.close();

        if (id.toUpperCase() == 'EXIT') {
          process.exit(0);
        }
        else if (_.isNumber(id*1) && id >= 0 && id < self.devices.length) {
          console.log("Selected "+ id +" ("+ self.devices[id].uuid +")");
          self.doExploreDevice(self.devices[id]);
        }
        else {
          if (self.devices.length > 1) {
            console.log(("You must enter a value between '0' and '"+ self.devices.length +"'!").red);
            self.doSelectDevice();
          }
          else {
            console.log("Only one device found, you can only select the device '0'".yellow);
            self.doSelectDevice();
          }
        }
      });
    }
    else {
      console.log("Couln't find any BLE device!".red);
      process.exit(-1);
    }
  };


  // event handlers
  this.onStateChange = function(state) {
    if (state === "poweredOn") {
      console.log("Bluetooth ready...");

      self.can_scan = true;
      self.doScan();
    }
    else {
      console.log("Bluetooth not ready!".red);
      self.can_scan = false;
    }
  };

  this.onScanStart = function() {
    console.log("Scanning for BLE devices...\n".italic);

    //             2    15                18                   8          8          8
    console.log("| #  | UUID            | Local Name         | Tx Power | RSSI     | Services                                      ".bold);
  };

  this.onScanStop = function() {
    console.log("Scanning for BLE devices stopped.".orange);
  };

  this.onScanDiscover = function(peripheral) {
    //console.log(peripheral);

    if (peripheral.advertisement) {
      var adv = peripheral.advertisement;
      console.log((
          "| " + l(self.devices.length, 2)
          + " | " + l(peripheral.uuid, 15)
          + " | " + l(adv.localName, 18)
          + " | " + l(adv.TxPowerLevel, 8, '---')
          + " | " + l(peripheral.rssi, 8, '---')
          + " | " + l(adv.serviceUuids.length, 8)
          ).green.bold);
    }
    else {
      console.log((
          "| " + l(self.devices.length, 2)
          + " | " + l(dev.uuid, 15)
          + " | " + l("-none-", 18)
          + " | " + l("---", 8)
          + " | " + l("---", 8)
          + " | " + l("---", 8)
          ).green);
    }

    // add device to list of found devices
    self.devices.push(peripheral);
  };


  // initialize bindings to noble events
  noble.on('scanStart', this.onScanStart);
  noble.on('stateChange', this.onStateChange);

  // construct and run this instance
  this.main();
}

// Run main program
var explorer = new BleExplorer();
