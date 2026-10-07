/*
   * @/shared/view/components/Input.component.tsx
   * Exports 3 components
   *    - InputNumber
   *    - InputString
   *    - InputChooseValue
   * 
   * 
   * 
   **   <InputNumber />
   * Designed for letting the user input a number
   * 
   * expected props: {
   *    label: string;
   *    dataRef: Ref<DataHandle<string>>;
   *    initial?: string;
   *    readOnlyOptions?: {
   *       condition: boolean;
   *       placeholder: string;
   *    }
   * }
   * && any other props you would expect to find in the respected component type
   * 
   * This component will prompt the user to enter a number, and store the number for the parent to use
   * The string can be accessed through ref using the { DataHandle<string> } getData + setData properties
   * 
   * readOnlyOptions provides the parent with the ability to show an uneditable version of the string if { condition } is true ({ placeholder } is whats shown if the string is empty)
   * 
   * 
   * 
   **   <InputString />
   * Designed for letting the user input a string
   * 
   * expected props: {
   *    type: 'text' | 'textarea'
   *    label: string;
   *    dataRef: Ref<DataHandle<string>>;
   *    initial?: string;
   *    readOnlyOptions?: {
   *       condition: boolean;
   *       placeholder: string;
   *    }
   * }
   * && any other props you would expect to find in the respected component type
   * 
   * This component will prompt the user to create a string, and store the string for the parent to use
   * The string can be accessed through ref using the { DataHandle<string> } getData + setData properties
   * 
   * readOnlyOptions provides the parent with the ability to show an uneditable version of the string if { condition } is true ({ placeholder } is whats shown if the string is empty)
   * 
   * 
   * 
   * 
   **   <InputChooseValue />
   * Designed for letting the user choose from a selection of already defined strings
   * 
   * expected props: {
   *    type: 'radio' | 'select'
   *    label: string;
   *    ref: Ref<DataHandle<T>>;
   *    initial?: T;
   *    optionList: {
   *       label: string;
   *       value: T;
   *    }[];   
   * }
   * && any other props you would expect to find in the respected component type
   * 
   * This component will prompt the user to select a string from { optionList }, and store the choice for the parent to use
   * The string can be accessed through ref using the { DataHandle<T> } getData + setData properties
*/




import styles from './styles/inputs.module.scss';
import { Ref, useId, useImperativeHandle, useState } from 'react';
import { DataHandle } from '../../domain/shared.types';






type InputNumberBaseProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> & {
   label: string;
   ref?: Ref<DataHandle<number>>;
   initial?: number;
   readOnlyOptions?: {
      condition: boolean;
      placeholder: string;
   };
}

export function InputNumber({ label, initial, ref, className, readOnlyOptions, ...rest }: InputNumberBaseProps) {
   const id = useId();
   const [value, setValue] = useState<number>(initial || 0);

   useImperativeHandle(ref, () => ({
      getData: () => value,
      setData: setValue,
   }),[value]);

   return (
      <div className={ [styles.inputWrapper, className].filter(Boolean).join(" ") }>
         { (readOnlyOptions?.condition === true) ? (
            <>
               <h4>{ label }</h4>
               <p>{ value || readOnlyOptions.placeholder }</p>
            </>
         ) : (
            <>
               <label htmlFor={ id }>{ label }</label>
               <input id={ id } type='number' value={ value } onChange={ (event) => setValue(Number(event.target.value)) } { ...rest } />
            </>) 
         }
      </div>
   );
}






type InputStringBaseProps = {
   label: string;
   ref?: Ref<DataHandle<string>>;
   initial?: string;
   readOnlyOptions?: {
      condition: boolean;
      placeholder: string;
   };
};

type InputTextProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> & InputStringBaseProps;
type InputTextAreaProps = React.ComponentPropsWithoutRef<'textarea'> & InputStringBaseProps;

type InputStringProps = ( InputTextProps & { type: 'text' } ) | ( InputTextAreaProps & { type: 'textarea' } );



export function InputString({ className, label, initial, ref, readOnlyOptions, ...props }: InputStringProps) {
   const id = useId();
   const [string, setString] = useState<string>(initial ?? '');

   useImperativeHandle(ref, () => ({
      getData: () => string,
      setData: setString
   }), [string]);

   // * grab the actual input component
   let inputComponent: React.ReactElement;
   if (props.type === 'text') {
      const { type, ...rest } = props;
      inputComponent = <input id={ id } type='text' value={ string } onChange={ (event) => setString(event.target.value) } { ...rest } />
   }
   else if (props.type === 'textarea') {
      const { type, ...rest } = props; 
      inputComponent = <textarea id={ id } value={ string } onChange={ (event) => { setString(event.target.value) } } { ...rest } />
   }
   else { throw new Error('@/shared/view/components/input.components.InputString received an invalid { type } field'); }

   return (
      <div className={ [styles.inputWrapper, className].filter(Boolean).join(" ") }>
         { (readOnlyOptions?.condition === true) ? (
            <>
               <h4>{ label }</h4>
               <p>{ string || readOnlyOptions.placeholder }</p>
            </>
         ) : (
            <>
               <label htmlFor={ id }>{ label }</label>
               { inputComponent }
            </>) 
         }
      </div>
   );
}






type InputChooseValueBaseProps<T> = {
   label: string;
   ref?: Ref<DataHandle<T>>;
   initial?: T;
   optionList: {
      label: string;
      value: T;
   }[];   
}

type InputRadioProps<T> = React.ComponentPropsWithoutRef<'fieldset'> & InputChooseValueBaseProps<T>;
type InputSelectProps<T> = React.ComponentPropsWithoutRef<'select'> & InputChooseValueBaseProps<T>;

type InputChooseValueProps<T> = ( InputRadioProps<T> & { type: 'radio' } ) | ( InputSelectProps<T> & { type: 'select' } );



export function InputChooseValue<T>({ ...props }: InputChooseValueProps<T>) {
    if (props.optionList.length === 0) { throw new Error("@/shared/view/components/input.components.tsx --> InputChooseValue.  { optionList } was empty, at least one list item is required."); }
   if (props.type === 'radio') {
      const { type, ...rest } = props;
      return <InputRadio { ...rest } />;
   }
   else if (props.type === 'select') { 
      const { type, ...rest } = props;
      return <InputSelect { ...rest } /> 
   }
   else { throw new Error('@/shared/view/components/input.components.InputChooseValue received an invalid { type } field'); }
}

function InputRadio<T>({ className, label, ref, optionList, initial, ...rest }: InputRadioProps<T>) {
   const id = useId();
   const [choice, setChoice] = useState<{ label: string, value: T }>(optionList[0]);

   useImperativeHandle(ref, () => ({
      getData: () => choice.value,
      setData: () => undefined,
   }),[choice]);
   
   return (
      <fieldset className={ [styles.inputRadioButtons, className].filter(Boolean).join(" ") } { ...rest }>
         <legend>{ label }</legend>
         { optionList.map((option, index) => (
            <div key={ index }>
               <input type='radio' id={ `${ id }-${ index }` } name={ id } value={ option.label } checked={ choice === option.value } onChange={() => { setChoice(option); } } />
               <label htmlFor={ `${ id }-${ index }` }>{ option.label }</label>
            </div>
         )) }
      </fieldset>
   );
}

function InputSelect<T>({ className, label, ref, optionList, initial, ...rest }: InputSelectProps<T>) {
   const id = useId();
   const [choice, setChoice] = useState<{ label: string, value: T }>(optionList[0]);

   useImperativeHandle(ref, () => ({
      getData: () => choice?.value,
      setData: () => undefined,
   }), [choice]);

   return (
      <div className={ [styles.inputSelect, className].filter(Boolean).join(" ") }>
         <label htmlFor={ id }>{ label }</label>
         <select
            id={ id }
            value={ choice?.label }
            onChange={ (event) => { setChoice(optionList[event.currentTarget.selectedIndex]); } }
            { ...rest }
         >
            { optionList.map((option, index) => (
               <option key={ index } value={ option.label }>{ option.label }</option>
            )) }
         </select>
      </div>
   );
}