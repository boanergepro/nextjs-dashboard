import { Metadata } from 'next';
import CustomersTable from '@/app/ui/customers/table';
import { fetchFilteredCustomers } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Customers',
};

export  default async function Page(
  {
    searchParams,
} : {   
    searchParams?: {
        query?: string;
        page?: string;
    } 
}
) {
  const customers = await fetchFilteredCustomers(searchParams?.query || '');

  return <CustomersTable customers={customers} />
}