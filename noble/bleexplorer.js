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

// Main program

function BleExplorer() {
  var self = this;

  //variables
  this.can_scan = false;
  this.devices = [];

  this.current_device = null;

  // constructor
  this.main = function() {
    console.log("    ,-.".green);
    console.log("   / \\  `.  __..-,O".green);
    console.log("  :   \\ --''_..-'.'".green);
    console.log("  |    . .-' `. '.".green);
    console.log("  :     .     .`.'".green);
    console.log("   \     `.  /  ..   ".green +"-----------------------".cyan);
    console.log("    \      `.   ' .  ".green +"     BLE Explorer v0.1 ".cyan);
    console.log("     `,       `.   \\".green +"   --------------------".cyan);
    console.log("    ,|,`.        `-.\\".green +"      for Node + Noble".green);
    console.log("   '.||  ``-...__..-`".green);
    console.log("    |  |".green);
    console.log("    |__|".green);
    console.log("    /||\\ ".green);
    console.log("   //||\\\\".green);
    console.log("  // || \\\\".green);
    console.log("_//__||__\\\\__".green);
    console.log("'--------------'".green);
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
    device.connect(function(error) {
      // store current device ref
      self.current_device = device;

      device.discoverServices([], function(error, services) {
        var serviceIndex = 0;

        // clear device services (create new array into device object)
        device.services = [];

        console.log("\nConnected to BLE peripheral, exploring services...\n".italic);

        //             2    32                                 32                                 18
        console.log("| #  | Service Handle (UUID)            | GATT Name                        | Properties  ".bold);

        async.whilst(function() {
          if (serviceIndex < services.length) {
            return true;
          }
          else {
            // done exploring services
            self.doSelectService(device);
            return false;
          }
        }, function(callback) {
          var service = services[serviceIndex];
          var serviceInfo = service.uuid;

          if (service.name) {
            serviceInfo += ' (' + service.name + ')';
          }
          //console.log(serviceInfo);

          // append service into device array
          device.services.push(service);
          service.index = device.services.length - 1;
          serviceIndex++;

          if (service.name) {
            // standard Bluetooth 4.0 Approved service UUID
            console.log((
                "| " + l(device.services.length, 2)
                + " | " + l(service.uuid, 32)
                + " | " + l(service.name, 32, '---')
                + " | " + l('---', 18)
                ).green);
          }
          else {
            // non-standard service UUID
            console.log((
                "| " + l(device.services.length, 2)
                + " | " + l(service.uuid, 32)
                + " | " + l('Unknown Service', 32)
                + " | " + l('---', 18)
                ).yellow);
          }

          // continue to next async item
          callback();

        }, function(err) {
          device.disconnect();
        });
      });
    });
  };

                  callback();
                callback();
            });
          });
      });
    });
  };

  this.doSelectDevice = function() {
    if (self.devices.length > 0) {

      var rl = readline.createInterface({
        input : process.stdin,
        output : process.stdout
      });


      rl.question("\nType # of the device to explore and press Enter:", function(id) {
        rl.close();

        if (id >= 0 && id < self.devices.length) {
          console.log("Selected "+ id +" ("+ self.devices[id].uuid +")");
          self.doExploreDevice(self.devices[id]);
        }
        else {
          if (self.devices.length > 1) {
            console.log(("You must enter a value between '0' and '"+ self.devices.length +"' !").red);
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
    console.log("| #  | UUID            | Local Name         | Tx Power | RSSI     | Services".bold);
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
          ).green);
    }
    else {
      console.log((
          "| " + l(self.devices.length, 2)
          + " | " + l(dev.uuid, 15)
          + " | " + l("-none-", 18)
          + " | " + l("---", 8)
          + " | " + l("---", 8)
          ).yellow);
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
