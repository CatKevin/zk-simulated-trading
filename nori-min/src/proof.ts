import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { compile, createFileManager } from '@noir-lang/noir_wasm';


export function test(str:String, num: number) {
    return str.length > num ? str.slice(0, num) + "..." : str;
  }

  export async function generateRecursiveProofArtifacts(publicInputs: string[], proof: Uint8Array)  {
    const circuit = await getCircuit('main');
    const backend = new BarretenbergBackend(circuit, { threads: navigator.hardwareConcurrency });
    const mainProofArtifacts = await backend.generateRecursiveProofArtifacts(
        { publicInputs, proof },
        1, // 1 public input
      );
  
    return mainProofArtifacts;
  }


export async function getCircuit(name: string) {
  const fm = createFileManager('/');
  const nr = (await fetch(`/api/readCircuitFile?filename=${name}/src/main.nr`))
    .body as ReadableStream<Uint8Array>;
  await fm.writeFile('./src/main.nr', nr);

  const nargoToml = (await fetch(`/api/readCircuitFile?filename=${name}/Nargo.toml`))
    .body as ReadableStream<Uint8Array>;
  await fm.writeFile('./Nargo.toml', nargoToml);

  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }

  return result.program;
}