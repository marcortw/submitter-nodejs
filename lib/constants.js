var config = require('./configloader');

const TCP = "TCP";
const UDP = "UDP";
const FQDN = "FQDN";
const URL = "URL";
const IPADDR = "IPADDR";
const IPRANGE = "IPRANGE";
const IPSUBNET = "IPSUBNET";

const REGEX_TCP = "^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$"; // from http://stackoverflow.com/questions/3715064/anyone-see-anything-wrong-with-my-regex-for-port-numbers
const REGEX_PORT = "^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$"; // from http://stackoverflow.com/questions/3715064/anyone-see-anything-wrong-with-my-regex-for-port-numbers
const REGEX_UDP = "^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$"; // from http://stackoverflow.com/questions/3715064/anyone-see-anything-wrong-with-my-regex-for-port-numbers
//const REGEX_URL = "^(?:(?:https?|ftp)://)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}-\x{ffff}]{2,})))(?::\d{2,5})?(?:/[^\s]*)?$_iuS"; // from https://mathiasbynens.be/demo/url-regex
const REGEX_URL = "(http|ftp|https)://[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?^$";
const REGEX_IPADDR = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";
const REGEX_IPCIDR = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(/([0-9]|[1-2][0-9]|3[0-2]))$";
const REGEX_IPRANGE = "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])[-](([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$";

const SPECIAL_ANY = "ANY";
const SPECIAL_UNKNOWN = "UNKNOWN";
const SPECIAL_KNOWN = "KNOWN";

module.exports = {
    TCP: TCP,
    UDP: UDP,
    REGEX_PORT: REGEX_PORT,
    REGEX_URL: REGEX_URL,
    REGEX_IPADDR: REGEX_IPADDR,
    REGEX_TCP: REGEX_TCP,
    REGEX_UDP: REGEX_UDP,
    REGEX_IPCIDR: REGEX_IPCIDR,
    REGEX_IPRANGE: REGEX_IPRANGE,
    SPECIAL_ANY: SPECIAL_ANY,
    SPECIAL_UNKNOWN: SPECIAL_UNKNOWN,
    SPECIAL_KNOWN: SPECIAL_KNOWN
};