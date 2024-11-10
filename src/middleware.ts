import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname; 
    const isPublicPath = path === "/signin" || path === "/signup"; 
    const isPrivatePath = path === "/Home";

    const usertoken = request.cookies.get('user_token')?.value || "";
    console.log("user_token : ", usertoken); 

    if (isPublicPath && usertoken) {
        return NextResponse.redirect(new URL("/", request.nextUrl)); 
    }
    if(!usertoken && isPrivatePath){
        return NextResponse.redirect(new URL("/signin", request.nextUrl));
    }

    if (!isPublicPath && !usertoken) {
        return NextResponse.redirect(new URL("/signin", request.nextUrl)); 
    }

     
    return NextResponse.next(); 
}
export const config = {
    matcher: ["/", "/signup", "/signin","/Home"],
  };