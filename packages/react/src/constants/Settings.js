export const settings = {
  prefix: 'cds',
  /**
   * Instead of extending existing carbon-classes we should create new ones when possible.
   * Use the iotPrefix instead of the carbon prefix to show that the class
   * contains iot specific properties.
   * E.g. instead of adding more properties to the carbon class ".bx--btn"
   * we use a new class ".iot--btn" to hold those iot specific properties.
   *
   * Should be kept in sync with SCSS variable $iot-prefix
   */
  iotPrefix: 'iot',
};
