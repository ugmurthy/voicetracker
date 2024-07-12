import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

import { logout } from '../modules/session/session.server'

/* export async function action({ request }: ActionFunctionArgs) {
  return await logout(request);
} */

export async function loader({request}:LoaderFunctionArgs) {
    console.log("Logout : Logging out...")
    return await logout(request)
}
