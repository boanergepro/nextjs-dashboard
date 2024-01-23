'use server'

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// la directiva use server marca todas la funciones exportadas aqui como funciones de servidor
// que se pueden importar en componentes del cliente y del servidor

// define un esquema de validacion de datos
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    // crear una feche con el formato AAAA-MM-DD
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (error) {
        return {
            message: 'Database error: Failed to create invoice.'
        }
    }

    // hacer que revalide la pagina de facturas(cuando se crea una nueva factura se debe actualizar la lista de facturas)
    revalidatePath('/dashboard/invoices');
    // redireccionar a la pagina de facturas
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId},amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;
    } catch (error) {
        return {
            message: 'Database error: Failed to update invoice.'
        }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

    try {
        await sql`
            DELETE FROM invoices
            WHERE id = ${id}
        `;
        return {message: 'Deleted invoice.'};
    } catch (error) {
        return {
            message: 'Database error: Failed to delete invoice.'
        }
    }

    revalidatePath('/dashboard/invoices');
}
    