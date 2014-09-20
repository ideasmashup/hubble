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

////////////////////////////////////////////////////////////////
// GATT Profiles
////////////////////////////////////////////////////////////////

// Format-types : https://developer.bluetooth.org/gatt/Pages/FormatTypes.aspx
var formats = {

  // Reserved for future use
  'rfu' : function(data) {
    return data.toString('hex');
  },
  // unsigned 16-bit integer or unsigned 128-bit integer
  'gatt_uuid' : function(data) {
    return data.toString('hex');
  },
  // unsigned 1-bit; 0 = false, 1 = true
  'boolean' : function(data) {
    return (data.toString('hex') == '1');
  },
  // 2-bit value
  '2bit' : function(data) {
    return data.toString('hex');
  },
  // 4-bit value
  'nibble' : function(data) {
    return data.toString('hex');
  },
  // 8-bit value
  '8bit' : function(data) {
    return data.toString('hex');
  },
  // 16-bit value
  '16bit' : function(data) {
    return data.toString('hex');
  },
  // 24-bit value
  '24bit' : function(data) {
    return data.toString('hex');
  },
  // 32-bit value
  '32bit' : function(data) {
    return data.toString('hex');
  },
  // unsigned 8-bit integer
  'uint8' : function(data) {
    return data.readUInt8();
  },
  // unsigned 12-bit integer
  'uint12' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 16-bit integer
  'uint16' : function(data) {
    return data.readUInt16LE();
  },
  // unsigned 24-bit integer
  'uint24' : function(data) {
     // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 32-bit integer
  'uint32' : function(data) {
    return data.readUInt32LE();
  },
  // unsigned 40-bit integer
  'uint40' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 48-bit integer
  'uint48' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 64-bit integer
  'uint64' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 128-bit integer
  'uint128' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // signed 8-bit integer
  'sint8' : function(data) {
    return data.readInt8();
  },
  // signed 12-bit integer
  'sint12' : function(data) {
    return parseInt(data.toString('hex'), 16);
  },
  // signed 16-bit integer
  'sint16' : function(data) {
    return data.readInt16LE();
  },
  // signed 24-bit integer
  'sint24' : function(data) {
    return parseInt(data.toString('hex'), 16);
  },
  // signed 32-bit integer
  'sint32' : function(data) {
    return data.readInt32LE();
  },
  // signed 48-bit integer
  'sint48' : function(data) {
    return parseInt(data.toString('hex'), 16);
  },
  // signed 64-bit integer
  'sint64' : function(data) {
    return parseInt(data.toString('hex'), 16);
  },
  // signed 128-bit integer
  'sint128' : function(data) {
    return pasreInt(data.toString('hex'), 16);
  },
  // IEEE-754 32-bit floating point
  'float32' : function(data) {
    return data.readFloatLE();
  },
  // IEEE-754 64-bit floating point
  'float64' : function(data) {
    return data.readFloatLE();
  },
  // IEEE-11073 16-bit SFLOAT
  'SFLOAT' : function(data) {
    return data.readFloatLE();
  },
  // IEEE-11073 32-bit FLOAT
  'FLOAT' : function(data) {
    return data.readFloatLE();
  },
  // double unsigned 16-bit integer
  'dunit16' : function(data) {
    return data.readDoubleLE();
  },
  // UTF-8 string
  'utf8s' : function(data) {
    return data.toString('utf8');
  },
  // UTF-16 string
  'utf16s' : function(data) {
    return data.toString('utf16le');
  },
  // Regulatory Certification Data List - Refer to IEEE 11073-20601 Regulatory Certification Data List characteristic
  'reg-cert-data-list' : function(data) {
    return data.toString('hex');
  },
  // Defined by the Service Specification
  'variable' : function(data) {
    return data.toString('hex');
  },
  // Example: uint8[]
  'Array[]' : function(data) {
    return data.toString('hex');
  }
};


var units = {
    0x2700  unitless  org.bluetooth.unit.unitless
    0x2701  length (metre)  org.bluetooth.unit.length.metre
    0x2702  mass (kilogram)   org.bluetooth.unit.mass.kilogram
    0x2703  time (second)   org.bluetooth.unit.time.second
    0x2704  electric current (ampere)   org.bluetooth.unit.electric_current.ampere
    0x2705  thermodynamic temperature (kelvin)  org.bluetooth.unit.thermodynamic_temperature.kelvin
    0x2706  amount of substance (mole)  org.bluetooth.unit.amount_of_substance.mole
    0x2707  luminous intensity (candela)  org.bluetooth.unit.luminous_intensity.candela
    0x2710  area (square metres)  org.bluetooth.unit.area.square_metres
    0x2711  volume (cubic metres)   org.bluetooth.unit.volume.cubic_metres
    0x2712  velocity (metres per second)  org.bluetooth.unit.velocity.metres_per_second
    0x2713  acceleration (metres per second squared)  org.bluetooth.unit.acceleration.metres_per_second_squared
    0x2714  wavenumber (reciprocal metre)   org.bluetooth.unit.wavenumber.reciprocal_metre
    0x2715  density (kilogram per cubic metre)  org.bluetooth.unit.density.kilogram_per_cubic_metre
    0x2716  surface density (kilogram per square metre)   org.bluetooth.unit.surface_density.kilogram_per_square_metre
    0x2717  specific volume (cubic metre per kilogram)  org.bluetooth.unit.specific_volume.cubic_metre_per_kilogram
    0x2718  current density (ampere per square metre)   org.bluetooth.unit.current_density.ampere_per_square_metre
    0x2719  magnetic field strength (ampere per metre)  org.bluetooth.unit.magnetic_field_strength.ampere_per_metre
    0x271A  amount concentration (mole per cubic metre)   org.bluetooth.unit.amount_concentration.mole_per_cubic_metre
    0x271B  mass concentration (kilogram per cubic metre)   org.bluetooth.unit.mass_concentration.kilogram_per_cubic_metre
    0x271C  luminance (candela per square metre)  org.bluetooth.unit.luminance.candela_per_square_metre
    0x271D  refractive index  org.bluetooth.unit.refractive_index
    0x271E  relative permeability   org.bluetooth.unit.relative_permeability
    0x2720  plane angle (radian)  org.bluetooth.unit.plane_angle.radian
    0x2721  solid angle (steradian)   org.bluetooth.unit.solid_angle.steradian
    0x2722  frequency (hertz)   org.bluetooth.unit.frequency.hertz
    0x2723  force (newton)  org.bluetooth.unit.force.newton
    0x2724  pressure (pascal)   org.bluetooth.unit.pressure.pascal
    0x2725  energy (joule)  org.bluetooth.unit.energy.joule
    0x2726  power (watt)  org.bluetooth.unit.power.watt
    0x2727  electric charge (coulomb)   org.bluetooth.unit.electric_charge.coulomb
    0x2728  electric potential difference (volt)  org.bluetooth.unit.electric_potential_difference.volt
    0x2729  capacitance (farad)   org.bluetooth.unit.capacitance.farad
    0x272A  electric resistance (ohm)   org.bluetooth.unit.electric_resistance.ohm
    0x272B  electric conductance (siemens)  org.bluetooth.unit.electric_conductance.siemens
    0x272C  magnetic flex (weber)   org.bluetooth.unit.magnetic_flex.weber
    0x272D  magnetic flex density (tesla)   org.bluetooth.unit.magnetic_flex_density.tesla
    0x272E  inductance (henry)  org.bluetooth.unit.inductance.henry
    0x272F  Celsius temperature (degree Celsius)  org.bluetooth.unit.thermodynamic_temperature.degree_celsius
    0x2730  luminous flux (lumen)   org.bluetooth.unit.luminous_flux.lumen
    0x2731  illuminance (lux)   org.bluetooth.unit.illuminance.lux
    0x2732  activity referred to a radionuclide (becquerel)   org.bluetooth.unit.activity_referred_to_a_radionuclide.becquerel
    0x2733  absorbed dose (gray)  org.bluetooth.unit.absorbed_dose.gray
    0x2734  dose equivalent (sievert)   org.bluetooth.unit.dose_equivalent.sievert
    0x2735  catalytic activity (katal)  org.bluetooth.unit.catalytic_activity.katal
    0x2740  dynamic viscosity (pascal second)   org.bluetooth.unit.dynamic_viscosity.pascal_second
    0x2741  moment of force (newton metre)  org.bluetooth.unit.moment_of_force.newton_metre
    0x2742  surface tension (newton per metre)  org.bluetooth.unit.surface_tension.newton_per_metre
    0x2743  angular velocity (radian per second)  org.bluetooth.unit.angular_velocity.radian_per_second
    0x2744  angular acceleration (radian per second squared)  org.bluetooth.unit.angular_acceleration.radian_per_second_squared
    0x2745  heat flux density (watt per square metre)   org.bluetooth.unit.heat_flux_density.watt_per_square_metre
    0x2746  heat capacity (joule per kelvin)  org.bluetooth.unit.heat_capacity.joule_per_kelvin
    0x2747  specific heat capacity (joule per kilogram kelvin)  org.bluetooth.unit.specific_heat_capacity.joule_per_kilogram_kelvin
    0x2748  specific energy (joule per kilogram)  org.bluetooth.unit.specific_energy.joule_per_kilogram
    0x2749  thermal conductivity (watt per metre kelvin)  org.bluetooth.unit.thermal_conductivity.watt_per_metre_kelvin
    0x274A  energy density (joule per cubic metre)  org.bluetooth.unit.energy_density.joule_per_cubic_metre
    0x274B  electric field strength (volt per metre)  org.bluetooth.unit.electric_field_strength.volt_per_metre
    0x274C  electric charge density (coulomb per cubic metre)   org.bluetooth.unit.electric_charge_density.coulomb_per_cubic_metre
    0x274D  surface charge density (coulomb per square metre)   org.bluetooth.unit.surface_charge_density.coulomb_per_square_metre
    0x274E  electric flux density (coulomb per square metre)  org.bluetooth.unit.electric_flux_density.coulomb_per_square_metre
    0x274F  permittivity (farad per metre)  org.bluetooth.unit.permittivity.farad_per_metre
    0x2750  permeability (henry per metre)  org.bluetooth.unit.permeability.henry_per_metre
    0x2751  molar energy (joule per mole)   org.bluetooth.unit.molar_energy.joule_per_mole
    0x2752  molar entropy (joule per mole kelvin)   org.bluetooth.unit.molar_entropy.joule_per_mole_kelvin
    0x2753  exposure (coulomb per kilogram)   org.bluetooth.unit.exposure.coulomb_per_kilogram
    0x2754  absorbed dose rate (gray per second)  org.bluetooth.unit.absorbed_dose_rate.gray_per_second
    0x2755  radiant intensity (watt per steradian)  org.bluetooth.unit.radiant_intensity.watt_per_steradian
    0x2756  radiance (watt per square metre steradian)  org.bluetooth.unit.radiance.watt_per_square_metre_steradian
    0x2757  catalytic activity concentration (katal per cubic metre)  org.bluetooth.unit.catalytic_activity_concentration.katal_per_cubic_metre
    0x2760  time (minute)   org.bluetooth.unit.time.minute
    0x2761  time (hour)   org.bluetooth.unit.time.hour
    0x2762  time (day)  org.bluetooth.unit.time.day
    0x2763  plane angle (degree)  org.bluetooth.unit.plane_angle.degree
    0x2764  plane angle (minute)  org.bluetooth.unit.plane_angle.minute
    0x2765  plane angle (second)  org.bluetooth.unit.plane_angle.second
    0x2766  area (hectare)  org.bluetooth.unit.area.hectare
    0x2767  volume (litre)  org.bluetooth.unit.volume.litre
    0x2768  mass (tonne)  org.bluetooth.unit.mass.tonne
    0x2780  pressure (bar)  org.bluetooth.unit.pressure.bar
    0x2781  pressure (millimetre of mercury)  org.bluetooth.unit.pressure.millimetre_of_mercury
    0x2782  length (ångström)   org.bluetooth.unit.length.ångström
    0x2783  length (nautical mile)  org.bluetooth.unit.length.nautical_mile
    0x2784  area (barn)   org.bluetooth.unit.area.barn
    0x2785  velocity (knot)   org.bluetooth.unit.velocity.knot
    0x2786  logarithmic radio quantity (neper)  org.bluetooth.unit.logarithmic_radio_quantity.neper
    0x2787  logarithmic radio quantity (bel)  org.bluetooth.unit.logarithmic_radio_quantity.bel
    0x27A0  length (yard)   org.bluetooth.unit.length.yard
    0x27A1  length (parsec)   org.bluetooth.unit.length.parsec
    0x27A2  length (inch)   org.bluetooth.unit.length.inch
    0x27A3  length (foot)   org.bluetooth.unit.length.foot
    0x27A4  length (mile)   org.bluetooth.unit.length.mile
    0x27A5  pressure (pound-force per square inch)  org.bluetooth.unit.pressure.pound_force_per_square_inch
    0x27A6  velocity (kilometre per hour)   org.bluetooth.unit.velocity.kilometre_per_hour
    0x27A7  velocity (mile per hour)  org.bluetooth.unit.velocity.mile_per_hour
    0x27A8  angular velocity (revolution per minute)  org.bluetooth.unit.angular_velocity.revolution_per_minute
    0x27A9  energy (gram calorie)   org.bluetooth.unit.energy.gram_calorie
    0x27AA  energy (kilogram calorie)   org.bluetooth.unit.energy.kilogram_calorie
    0x27AB  energy (kilowatt hour)  org.bluetooth.unit.energy.kilowatt_hour
    0x27AC  thermodynamic temperature (degree Fahrenheit)   org.bluetooth.unit.thermodynamic_temperature.degree_fahrenheit
    0x27AD  percentage  org.bluetooth.unit.percentage
    0x27AE  per mille   org.bluetooth.unit.per_mille
    0x27AF  period (beats per minute)   org.bluetooth.unit.period.beats_per_minute
    0x27B0  electric charge (ampere hours)  org.bluetooth.unit.electric_charge.ampere_hours
    0x27B1  mass density (milligram per decilitre)  org.bluetooth.unit.mass_density.milligram_per_decilitre
    0x27B2  mass density (millimole per litre)  org.bluetooth.unit.mass_density.millimole_per_litre
    0x27B3  time (year)   org.bluetooth.unit.time.year
    0x27B4  time (month)  org.bluetooth.unit.time.month
    0x27B5  concentration (count per cubic metre)   org.bluetooth.unit.concentration.count_per_cubic_metre
    0x27B6  irradiance (watt per square metre)  org.bluetooth.unit.irradiance.watt_per_square_metre
    0x27B7  milliliter (per kilogram per minute)  org.bluetooth.unit.milliliter_per_kilogram_per_minute
    0x27B8  mass (pound)  org.bluetooth.unit.mass.pound
};

var characteristics = {

};

var types = {
  // Reserved for future use
  'rfu' : function(data) {
    return data.toString('hex');
  },
  // unsigned 16-bit integer or unsigned 128-bit integer
  'gatt_uuid' : function(data) {
    return data.toString('hex');
  },
  // unsigned 1-bit; 0 = false, 1 = true
  'boolean' : function(data) {
    return (data.toString('hex') == '1');
  },
  // 2-bit value
  '2bit' : function(data) {
    return data.toString('hex');
  },
  // 4-bit value
  'nibble' : function(data) {
    return data.toString('hex');
  },
  // 8-bit value
  '8bit' : function(data) {
    return data.toString('hex');
  },
  // 16-bit value
  '16bit' : function(data) {
    return data.toString('hex');
  },
  // 24-bit value
  '24bit' : function(data) {
    return data.toString('hex');
  },
  // 32-bit value
  '32bit' : function(data) {
    return data.toString('hex');
  },
  // unsigned 8-bit integer
  'uint8' : function(data) {
    return data.readUInt8();
  },
  // unsigned 12-bit integer
  'uint12' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 16-bit integer
  'uint16' : function(data) {
    return data.readUInt16LE();
  },
  // unsigned 24-bit integer
  'uint24' : function(data) {
     // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 32-bit integer
  'uint32' : function(data) {
    return data.readUInt32LE();
  },
  // unsigned 40-bit integer
  'uint40' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 48-bit integer
  'uint48' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 64-bit integer
  'uint64' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // unsigned 128-bit integer
  'uint128' : function(data) {
    // FIXME implement bit-wise shifting to convert to unsigned value?
    return parseInt(data.toString('hex'), 16);
  },
  // signed 8-bit integer
  'sint8' : function(data) {
    return data.readInt8();
  },
  // signed 12-bit integer
  'sint12' : function(data) {
    return parseInt(data.toString('hex'), 16);
  },
  // signed 16-bit integer
  'sint16' : function(data) {
    return data.readInt16LE();
  },
  // signed 24-bit integer
  'sint24' : function(data) {
    return parseInt(data.toString('hex'), 16);
  },
  // signed 32-bit integer
  'sint32' : function(data) {
    return data.readInt32LE();
  },
  // signed 48-bit integer
  'sint48' : function(data) {
    return parseInt(data.toString('hex'), 16);
  },
  // signed 64-bit integer
  'sint64' : function(data) {
    return parseInt(data.toString('hex'), 16);
  },
  // signed 128-bit integer
  'sint128' : function(data) {
    return pasreInt(data.toString('hex'), 16);
  },
  // IEEE-754 32-bit floating point
  'float32' : function(data) {
    return data.readFloatLE();
  },
  // IEEE-754 64-bit floating point
  'float64' : function(data) {
    return data.readFloatLE();
  },
  // IEEE-11073 16-bit SFLOAT
  'SFLOAT' : function(data) {
    return data.readFloatLE();
  },
  // IEEE-11073 32-bit FLOAT
  'FLOAT' : function(data) {
    return data.readFloatLE();
  },
  // double unsigned 16-bit integer
  'dunit16' : function(data) {
    return data.readDoubleLE();
  },
  // UTF-8 string
  'utf8s' : function(data) {
    return data.toString('utf8');
  },
  // UTF-16 string
  'utf16s' : function(data) {
    return data.toString('utf16le');
  },
  // Regulatory Certification Data List - Refer to IEEE 11073-20601 Regulatory Certification Data List characteristic
  'reg-cert-data-list' : function(data) {
    return data.toString('hex');
  },
  // Defined by the Service Specification
  'variable' : function(data) {
    return data.toString('hex');
  },
  // Example: uint8[]
  'Array[]' : function(data) {
    return data.toString('hex');
  }
}

exports.formats = formats;
exports.convert = types;