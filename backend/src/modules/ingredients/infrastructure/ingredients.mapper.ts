export function breakupMeasureDescription(measureDescription: string ): { number: number, string: string } {
   let numberAsString = "";
   let denominator = "";
   let slashFound = false;
   let unitStart = 0;

   // go through each number in the string until a character is found
   for (let i = 0; i < measureDescription.length; i++) {
      if (/[\d.]/.test(measureDescription[i]!)) {
         if(!slashFound) numberAsString += measureDescription[i];
         else denominator += measureDescription[i];
      } 
      else if (measureDescription[i] == "/") slashFound = true;
      else{
         if (measureDescription[i] == " ") unitStart = i + 1;
         else unitStart = i;
         break;
      }
   }

   const number = Number(numberAsString) / (Number(denominator) || 1);

   const string =  measureDescription.slice(unitStart);

   return { number, string }
}

export function calculateTrueConversionFactorValue(originalValueFromDatabase: number, extractedNumberFromMeasureDescription: number) {
   return (originalValueFromDatabase / extractedNumberFromMeasureDescription) * 100; // multiply 100 since the database recognizes the base as 100grams but the server recognizes base as 1gram
}