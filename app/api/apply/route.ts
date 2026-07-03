import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxMzrlnZRMzprw9IwUUolNO54KsJHeYexQIwpcuCJ-DYBPzSrffd90migbdGPpt9oh0/exec";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json(
        { success: false, message: "Invalid request payload." },
        { status: 400 }
      );
    }

    console.log("Sending to Apps Script:");
    console.log(data);

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const text = await response.text();

    console.log("Status:", response.status);
    console.log("Response:", text);

    if (!response.ok) {
      console.error("Apps Script error:", response.status, text);
      return NextResponse.json(
        {
          success: false,
          message: `Apps Script error ${response.status}: ${text}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      response: text,
    });

  } catch (error) {

    console.error("ERROR:");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: String(error),
      },
      {
        status: 500,
      }
    );

  }
}
