import { Input, InputProps } from '@chakra-ui/input';
import React from 'react';
import { useDebounce } from 'react-use';


export type SearchInputProps = Omit<InputProps, 'onChange'> & {
  onChange?: (value: string) => void,
  debounce?: number
};


export function SearchInput(props: SearchInputProps) : JSX.Element {
  const { debounce = 300, onChange, ...inputProps } = props;
  const [value, setValue] = React.useState('');

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValue(value);
  }, []);
  
  const [, cancel] = useDebounce(() => {
    props.onChange?.(value);
  }, debounce, [value]);

  return (
    <Input
      placeholder='Search...'
      bg='gray.300'
      value={value}
      onChange={handleChange}
      {...inputProps}
    />
  );
}