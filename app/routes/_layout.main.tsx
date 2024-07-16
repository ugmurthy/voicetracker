import {useLoaderData, useRouteLoaderData} from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '~/modules/session/session.server';


export async function loader(args:LoaderFunctionArgs) {
  //console.log("LOADER /main")
  const userId = await requireUserId(args.request);
  //console.log("/main ",userId)
  return {userId}  
}

export function Component() {
  const {userId} = useLoaderData();
  const {user} = useRouteLoaderData('root');
  
  return (
    <div className="p-10 text-center">
    <div className=" text-5xl">Main Page</div>
    <div> {`${user.name} ( ${user.email} ) logged in`}</div>
  </div>)
}

export default Component