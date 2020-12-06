import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
};

export const InputField: React.FC<InputFieldProps> = ({label,size: _, ...props}) => { {/* Extracting label and size from props as Input does not need lablel and number (giving error) inside when passing props */}
    const[field, {error}] = useField(props); // special hook from formik
        return (
            <FormControl isInvalid={!!error}> {/* typescript way to cast string to boolean */}
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <Input {...field} {...props} id={field.name} placeholder={props.placeholder} />
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
              </FormControl>
        );
}