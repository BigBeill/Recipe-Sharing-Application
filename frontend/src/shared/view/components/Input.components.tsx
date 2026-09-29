/*
   * @/shared/view/components/Input.component.tsx
   * Exports 2 components
   *    - InputString
   *    - InputChooseString
   * 
   * 
   * 
   **   <InputString />
   * Designed for letting the user input a custom string
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
   *    nestedComponentList?: React.ReactElement[]
   * }
   * && any other props you would expect to find in the respected component type
   * 
   * This component will prompt the user to create a string, and store the string for the parent to use
   * The string can be accessed through ref using the { DataHandle<string> } getData + setData properties
   * 
   * readOnlyOptions provides the parent with the ability to show an uneditable version of the string if { condition } is true ({ placeholder } is whats shown if the string is empty)
   * 
   * nestedComponentList lets the user add secondary react components that sit beside the main component, since <InputString /> is set to take up 100% of the width
   * 
   * 
   * 
   **   <InputChooseString />
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
import { cloneElement, Ref, useId, useImperativeHandle, useState } from 'react';
import { DataHandle } from '../../domain/shared.types';






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

type InputStringVariant = ( InputTextProps & { type: 'text' } ) | ( InputTextAreaProps & { type: 'textarea' } );

type InputStringProps = InputStringVariant & {
   nestedComponentList?: React.ReactElement<{ className?: string }>[];
};



export function InputString({ nestedComponentList, ...props }: InputStringProps) {
   let inputComponent: React.ReactElement
   if (props.type === 'text') { 
      const { type, ...rest } = props;
      inputComponent = <InputText { ...rest } />; 
   }
   else if (props.type === 'textarea') {
      const { type, ...rest } = props; 
      inputComponent = <InputTextArea { ...rest } />; 
   }
   else { throw new Error('@/shared/view/components/input.components.InputString received an invalid { type } field'); }

   return (
      <div className={ styles.componentWrapper }>
         { inputComponent }
         { nestedComponentList?.map((component, index) => {
            return cloneElement(component, {
               key: component.key ?? index,
               className: [ component.props.className, styles.secondaryInput].filter(Boolean).join(' '),
            })
         }) }
      </div>
   )
}

function InputText({ className, label, ref, readOnlyOptions, initial, ...rest }: InputTextProps) {
   const id = useId();
   const [value, setValue] = useState(initial || '');

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
               <input id={ id } type='text' value={ value } onChange={ (event) => setValue(event.target.value) } { ...rest } />
            </>) 
         }
      </div>
   )
}

function InputTextArea({ className, label, ref, initial, readOnlyOptions, ...rest }: InputTextAreaProps) {
   const id = useId();
   const [value, setValue] = useState<string>(initial || '');

   useImperativeHandle(ref, () => ({
      getData: () => value,
      setData: setValue
   }), [value]);

   return (
      <div className={ [styles.inputWrapper, className].filter(Boolean).join(" ") }>
         { (readOnlyOptions?.condition === true) ? (<>
            <h4>{ label }</h4>
            <p>{ value || readOnlyOptions.placeholder }</p>
         </>) : (<>
            <label htmlFor={ id } >{ label }</label>
            <textarea id={ id } value={ value } onChange={ (event) => { setValue(event.target.value) } } { ...rest } />
         </>) }
      </div>
   );
}






type InputChooseStringT = string | number | readonly string[];

type InputChooseStringBaseProps<T extends InputChooseStringT> = {
   label: string;
   ref?: Ref<DataHandle<T>>;
   initial?: T;
   optionList: {
      label: string;
      value: T;
   }[];   
}

type InputRadioProps<T extends InputChooseStringT> = React.ComponentPropsWithoutRef<'fieldset'> & InputChooseStringBaseProps<T>;
type InputSelectProps<T extends InputChooseStringT> = React.ComponentPropsWithoutRef<'select'> & InputChooseStringBaseProps<T>;

type InputChooseStringProps<T extends InputChooseStringT> = ( InputRadioProps<T> & { type: 'radio' } ) | ( InputSelectProps<T> & { type: 'select' } );



export function InputChooseString<T extends InputChooseStringT>({ ...props }: InputChooseStringProps<T>) {
   if ( props.optionList.length === 0) { throw new Error('@/shared/view/components/input.components.InputChooseString received an invalid { optionList } field'); }
   if (props.type === 'radio') {
      const { type, ...rest } = props;
      return <InputRadio { ...rest } />;
   }
   else if (props.type === 'select') { 
      const { type, ...rest } = props;
      return <InputSelect { ...rest } /> 
   }
   else { throw new Error('@/shared/view/components/input.components.InputChooseString received an invalid { type } field'); }
}

function InputRadio<T extends InputChooseStringT>({ className, label, ref, optionList, initial, ...rest }: InputRadioProps<T>) {
   const id = useId();
   const [choice, setChoice] = useState<T>(initial ?? optionList[0].value);

   useImperativeHandle(ref, () => ({
      getData: () => choice,
      setData: setChoice,
   }),[choice]);
   
   return (
      <fieldset className={ [styles.inputRadioButtons, className].filter(Boolean).join(" ") } { ...rest }>
         <legend>{ label }</legend>
         { optionList.map((option, index) => (
            <div key={ index }>
               <input type='radio' id={ `${ id }-${ index }` } name={ id } value={ option.value } checked={ choice === option.value } onChange={() => { setChoice(option.value); } } />
               <label htmlFor={ `${ id }-${ index }` }>{ option.label }</label>
            </div>
         )) }
      </fieldset>
   );
}

function InputSelect<T extends InputChooseStringT>({ className, label, ref, optionList, initial, ...rest }: InputSelectProps<T>) {
   const id = useId();
   const [choice, setChoice] = useState<T>(initial ?? optionList[0].value);

   useImperativeHandle(ref, () => ({
      getData: () => choice,
      setData: setChoice,
   }), [choice]);

   return (
      <div className={ [styles.inputSelect, className].filter(Boolean).join(" ") }>
         <label htmlFor={ id }>{ label }</label>
         <select
            id={ id }
            value={ choice }
            onChange={ (e) => { setChoice(optionList[e.currentTarget.selectedIndex].value); } }
            { ...rest }
         >
            { optionList.map((option, index) => (
               <option key={ index } value={ option.value }>{ option.label }</option>
            )) }
         </select>
      </div>
   );
}