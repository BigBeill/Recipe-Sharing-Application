import styles from './styles/inputs.module.scss';
import { Ref, useImperativeHandle, useState } from 'react';
import { DataHandle } from '../../domain/shared.types';



interface InputRadioButtonParams<T> {
   legend: string;
   optionList: { label: string, value: string}[];
   ref: Ref<DataHandle<T>>;
   initial?: T;
}

export function InputRadioButtons<T>({ legend, ref, optionList, initial }: InputRadioButtonParams<T>) {

   const [choice, setChoice] = useState<T>(initial || optionList[0].value as T);

   useImperativeHandle(ref, () => ({
      getData: () => choice,
      setData: setChoice,
   }),[]);
   
   return (
      <fieldset className={ styles.inputRadioButtons }>
         <legend>{ legend }</legend>
         { optionList.map((option, index) => (
            <div key={ index }>
               <input type='radio' id={ option.value } name={ option.value } value={ option.value } checked={ choice == option.value } onChange={() => { setChoice(option.value as T); } } />
               <label htmlFor={ option.value }>{ option.label }</label>
            </div>
         )) }
      </fieldset>
   );
}



/*
   In the event that you only want to let text be editable under specific conditions (edit mode enabled) you can supply readOnlyOptions,
   otherwise the component will always be in edit mode
*/
type InputTextParams = React.ComponentPropsWithoutRef<'input'> & {
   label: string;
   dataRef?: Ref<DataHandle<string>>
   initial?: string
   readOnlyOptions?: {
      condition: boolean;
      placeholder: string;
   }
}

export function InputText({ className, label, dataRef, readOnlyOptions, initial, ...rest }: InputTextParams) {
   const [value, setValue] = useState(initial || '');

   useImperativeHandle(dataRef, () => ({
      getData: () => value,
      setData: setValue,
   }),[value]);

   return (
      <div className={ [styles.inputTextWrapper, className].filter(Boolean).join(" ") }>
         { (readOnlyOptions?.condition === true) ? (
            <>
               <h4>{ label }</h4>
               <p>{ value || readOnlyOptions.placeholder }</p>
            </>
         ) : (
            <>
               <label>{ label }</label>
               <input type='text' value={ value } onChange={ (event) => setValue(event.target.value) } { ...rest } />
            </>) 
         }
      </div>
   )
}






interface InputTextAreaParams {
   label: string;
   placeholder: string;
   dataRef: Ref<DataHandle<string>>
   initial?: string;
   readOnlyOptions?: {
      condition: boolean;
      placeholder: string;
   }
}

export function InputTextArea({ label, placeholder, dataRef, initial, readOnlyOptions }: InputTextAreaParams) {
   const [value, setValue] = useState<string>(initial || '');

   useImperativeHandle(dataRef, () => ({
      getData: () => value,
      setData: setValue
   }), [value]);

   return (
      <div className={ styles.inputTextWrapper }>
         { (readOnlyOptions?.condition === true) ? (<>
            <h4>{ label }</h4>
            <p>{ value || readOnlyOptions.placeholder }</p>
         </>) : (<>
            <label>{ label }</label>
            <textarea value={ value } placeholder={ placeholder } onChange={ (event) => { setValue(event.target.value) } } />
         </>) }
      </div>
   );
}