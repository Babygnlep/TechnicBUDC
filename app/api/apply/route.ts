import { NextResponse } from "next/server";

// Web app URL (must be the deployed Exec URL, not the library edit URL)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw_aecArDua321LObYkBEB939Sw79p8AIrGbeohzkKEp3zcPbeF0xUaYkJUQLrHimsT/exec";

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

    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();

    console.log("Status:", response.status);
    console.log("Response content-type:", contentType);
    console.log("Response body:", text);

    // If Apps Script returns HTML (e.g., an error page), provide a clearer message
    if (!response.ok || !contentType.includes("application/json")) {
      const message = contentType.includes("text/html")
        ? "Apps Script returned HTML. Check the deployed Exec URL and access permissions."
        : `Apps Script error ${response.status}: ${text}`;

      console.error("Apps Script error:", response.status, text);
      return NextResponse.json(
        {
          success: false,
          message,
          raw: text,
        },
        { status: response.status }
      );
    }

    // JSON response from Apps Script
    const json = JSON.parse(text || "{}");

    return NextResponse.json({ success: true, status: response.status, response: json });

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
