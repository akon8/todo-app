
exports.getDate = function() {
  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
//adding a date and its values to "day" variable
  return today.toLocaleDateString("en-US", options);

}; // getDate
