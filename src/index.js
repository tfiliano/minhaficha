import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import net from "net";

config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL) || 5000;

// Function to send ZPL to printer
async function sendToPrinter(print) {
  const { nome, ip, port, zpl, tipo_de_conexao } = print;
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let responseData = "";

    client.connect(port, ip, () => {
      console.log(`Connected to printer at ${ip}:${port}`);
      client.write(zpl);
    });

    client.on("data", (data) => {
      responseData += data.toString();
    });

    client.on("close", () => {
      resolve(responseData);
    });

    client.on("error", (error) => {
      reject(error);
    });

    // Set a timeout
    setTimeout(() => {
      client.destroy();
      reject(new Error("Print timeout"));
    }, 10000);
  });
}

// Function to process a single print job
async function processPrintJob(job) {
  try {
    console.log(`Processing job ${job.id}`);

    // Update status to printing
    await supabase
      .from("etiquetas")
      .update({ status: "printing" })
      .eq("id", job.id);

    // Get printer details
    if (!job.impressora_id) {
      throw new Error("No printer assigned to job");
    }

    const { data: printer, error: printerError } = await supabase
      .from("impressoras")
      .select("*")
      .eq("id", job.impressora_id)
      .single();

    if (printerError)
      throw new Error(`Printer not found: ${printerError.message}`);

    // Send to printer
    await sendToPrinter({
      nome: printer.nome,
      ip: printer.ip,
      port: printer.porta || 9100,
      zpl: job.command,
      tipo_de_conexao: printer.tipo_de_conexao
    });

    // Update status to completed
    await supabase
      .from("etiquetas")
      .update({ status: "completed" })
      .eq("id", job.id);

    console.log(`Job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);

    // Update status to failed
    await supabase
      .from("etiquetas")
      .update({
        status: "failed",
        error_message: error.message,
      })
      .eq("id", job.id);
  }
}

// Main polling function
async function pollPrintQueue() {
  try {
    // Get pending print jobs
    const { data: jobs, error } = await supabase
      .from("etiquetas")
      .select("*")
      .eq("status", "pending")
      .order("created_at");

    if (error) throw error;

    // Process each job
    for (const job of jobs) {
      await processPrintJob(job);
    }
  } catch (error) {
    console.error("Error polling print queue:", error);
  }

  // Schedule next poll
  setTimeout(pollPrintQueue, POLL_INTERVAL);
}

// Start polling
console.log("Print service starting...");
pollPrintQueue();

// Handle process termination
process.on("SIGINT", async () => {
  console.log("Shutting down print service...");
  process.exit(0);
});
