
"use client";
import React, { useState } from 'react';
import { TextField } from '@hdfclife-insurance/one-x-ui';

type Field = {
  name: string;
  placeholder: string;
  type: string;
  validation?: {
    minLength?: number;
    pattern?: RegExp;
  };
  errorMessage?: string;
};

type Props = {
  fields: Field[];
};

const DynamicForm = ({ fields }: Props) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.name] = '';
    });
    return initial;
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Validate on change
    const field = fields.find((f) => f.name === name);
    if (field) {
      let error = '';
      if (field.validation) {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          error = field.errorMessage || `Minimum length is ${field.validation.minLength}`;
        } else if (field.validation.pattern && !field.validation.pattern.test(value)) {
          error = field.errorMessage || 'Invalid format';
        }
      }
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  return (
    <form autoComplete="off">
      {fields.map((field) => (
        <div key={field.name} style={{ marginBottom: 20 }}>
          <TextField
            characterCount=""
            computedValue=""
            helperText={{
              message: formErrors[field.name] || '',
              status: formErrors[field.name] ? 'error' : 'success',
            }}
            label={{
              infoMessage: '',
              label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
              optional: false,
            }}
            placeholder={field.placeholder}
            variant="outline"
            type={field.type as 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | undefined}
            value={formValues[field.name]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(field.name, e.target.value)}
          />
        </div>
      ))}
    </form>
  );
};

export default DynamicForm;