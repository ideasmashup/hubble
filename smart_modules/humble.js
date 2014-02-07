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
 * <h3>Helpers and Utility functions for BLE</h3>
 * <p>
 * This provides tools to allow proper rendering, parsing and processing of BLE
 * data transmitted to and from devices, classes and functions to handle common
 * tasks efficiently and quickly.
 * </p>
 * <strong>Features:</strong>
 * <ul>
 * <li>conversion from binary (or hex) data to javascript values</li>
 * <li>conversion of javascript values into binary (or hex) data</li>
 * <li>rendering of characteristics into user-readable values</li>
 * <li>built-in locale support for localized display of any value</li>
 * </ul>
 * 
 * @author William ANGER <wanger+humble at smartificiel.com>
 */

// Format-types : https://developer.bluetooth.org/gatt/Pages/FormatTypes.aspx
var formats = {
  // Reserved for future use
  'rfu' : function(val) {
    return null;
  },
  // unsigned 16-bit integer or unsigned 128-bit integer
  'gatt_uuid' : function(val) {
    return null;
  },
  // unsigned 1-bit; 0 = false, 1 = true
  'boolean' : function(val) {
    return null;
  },
  // 2-bit value
  '2bit' : function(val) {
    return null;
  },
  // 4-bit value
  'nibble' : function(val) {
    return null;
  },
  // 8-bit value
  '8bit' : function(val) {
    return null;
  },
  // 16-bit value
  '16bit' : function(val) {
    return null;
  },
  // 24-bit value
  '24bit' : function(val) {
    return null;
  },
  // 32-bit value
  '32bit' : function(val) {
    return null;
  },
  // unsigned 8-bit integer
  'uint8' : function(val) {
    return null;
  },
  // unsigned 12-bit integer
  'uint12' : function(val) {
    return null;
  },
  // unsigned 16-bit integer
  'uint16' : function(val) {
    return null;
  },
  // unsigned 24-bit integer
  'uint24' : function(val) {
    return null;
  },
  // unsigned 32-bit integer
  'uint32' : function(val) {
    return null;
  },
  // unsigned 40-bit integer
  'uint40' : function(val) {
    return null;
  },
  // unsigned 48-bit integer
  'uint48' : function(val) {
    return null;
  },
  // unsigned 64-bit integer
  'uint64' : function(val) {
    return null;
  },
  // unsigned 128-bit integer
  'uint128' : function(val) {
    return null;
  },
  // signed 8-bit integer
  'sint8' : function(val) {
    return null;
  },
  // signed 12-bit integer
  'sint12' : function(val) {
    return null;
  },
  // signed 16-bit integer
  'sint16' : function(val) {
    return null;
  },
  // signed 24-bit integer
  'sint24' : function(val) {
    return null;
  },
  // signed 32-bit integer
  'sint32' : function(val) {
    return null;
  },
  // signed 48-bit integer
  'sint48' : function(val) {
    return null;
  },
  // signed 64-bit integer
  'sint64' : function(val) {
    return null;
  },
  // signed 128-bit integer
  'sint128' : function(val) {
    return null;
  },
  // IEEE-754 32-bit floating point
  'float32' : function(val) {
    return null;
  },
  // IEEE-754 64-bit floating point
  'float64' : function(val) {
    return null;
  },
  // IEEE-11073 16-bit SFLOAT
  'SFLOAT' : function(val) {
    return null;
  },
  // IEEE-11073 32-bit FLOAT
  'FLOAT' : function(val) {
    return null;
  },
  // double unsigned 16-bit integer
  'dunit16' : function(val) {
    return null;
  },
  // UTF-8 string
  'utf8s' : function(val) {
    return null;
  },
  // UTF-16 string
  'utf16s' : function(val) {
    return null;
  },
  // Regulatory Certification Data List - Refer to IEEE 11073-20601 Regulatory Certification Data List characteristic
  'reg-cert-data-list' : function(val) {
    return null;
  },
  // Defined by the Service Specification
  'variable' : function(val) {
    return null;
  },
  // Example: uint8[]
  'Array[]' : function(val) {
    return null;
  },
};

var units = {

};

var convert = {

};

var characteristics = {

};

exports.convert = convert;
