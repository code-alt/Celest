<script>
  import { onMount } from "svelte";

  let midiInputs = $state([]);
  let selectedInputId = $state("");
  let selectedChannel = $state("");
  let selectedVoicing = $state("");
  let voiceCount = $state("");
  let selectedDevices = $state([]);
  let error = $state("");
  let isStarted = $state(false);
  let themeMode = $state("auto");
  let bpm = $state(120);
  let timeSignature = $state("4/4");
  let chordChangeRate = $state("measure");
  let selectedKey = $state("C-major");
  let complexity = $state(50);
  let conventionalism = $state(50);
  let voiceSpread = $state(50);
  let nextDeviceId = 0;

  const channels = Array.from({ length: 16 }, (_, index) => index + 1);

  function selectInput(event) {
    selectedInputId = event.currentTarget.value;
    selectedChannel = "";
  }

  function selectVoicing(event) {
    selectedVoicing = event.currentTarget.value;

    if (selectedVoicing === "1" || selectedVoicing === "2") {
      voiceCount = "1";
    } else if (selectedVoicing) {
      voiceCount = "";
    }
  }

  function toggleStarted() {
    isStarted = !isStarted;
  }

  function cutOffAllVoices() {
    isStarted = false;
  }

  function selectTheme(event) {
    themeMode = event.currentTarget.value;
    applyTheme(themeMode);
  }

  function applyTheme(mode) {
    const isDark =
      mode === "dark" ||
      (mode === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
  }

  function getNextAvailableChannel(inputId) {
    return channels.find((channel) => !isChannelUsed(inputId, channel)) ?? "";
  }

  onMount(async () => {
    applyTheme(themeMode);

    if (!navigator.requestMIDIAccess) {
      error = "Web MIDI is not supported in this browser.";
      return;
    }

    try {
      const midiAccess = await navigator.requestMIDIAccess();

      const updateInputs = () => {
        midiInputs = Array.from(midiAccess.inputs.values());
      };

      updateInputs();
      midiAccess.onstatechange = updateInputs;

      return () => {
        midiAccess.onstatechange = null;
      };
    } catch {
      error = "MIDI access was denied. Check your browser permissions.";
    }
  });

  function addDevice() {
    const input = midiInputs.find(({ id }) => id === selectedInputId);
    const channel = Number(
      selectedChannel || getNextAvailableChannel(input?.id),
    );

    if (
      !input ||
      !selectedVoicing ||
      !voiceCount ||
      !channel ||
      isChannelUsed(input.id, channel)
    ) {
      return;
    }

    selectedDevices = [
      ...selectedDevices,
      {
        id: nextDeviceId++,
        inputId: input.id,
        name: input.name || "Unnamed MIDI device",
        channel,
        voicing: Number(selectedVoicing),
        voiceCount: Number(voiceCount),
      },
    ];

    selectedChannel = "";
  }

  function removeDevice(deviceId) {
    selectedDevices = selectedDevices.filter(({ id }) => id !== deviceId);
  }

  function isChannelUsed(inputId, channel, excludedDeviceId = null) {
    return selectedDevices.some(
      (device) =>
        device.id !== excludedDeviceId &&
        device.inputId === inputId &&
        device.channel === channel,
    );
  }

  function voiceName(voicing) {
    switch (voicing) {
      case 1:
        return "Sub Bass";
      case 2:
        return "Bass";
      case 3:
        return "Mid - Low";
      case 4:
        return "Mid - High";
      case 5:
        return "Treble";
      default:
        return "";
    }
  }
</script>

<div
  class="flex flex-col gap-2.5 p-[10px] min-[1230px]:min-h-screen min-[1230px]:flex-row min-[1230px]:items-center"
>
  <div
    class="flex flex-col items-center gap-1.5 min-[1230px]:w-[200px] min-[1230px]:flex-none min-[1230px]:hidden"
  >
    <h1 class="text-center text-3xl text-cyan-700 dark:text-cyan-100">
      Celeste
    </h1>
    <span class="text-sm text-slate-600 dark:text-slate-400"
      >by Ethan Solace</span
    >
  </div>
  <div
    class="relative flex min-h-[600px] min-w-[600px] flex-1 flex-col items-center justify-center rounded-lg border border-slate-300 bg-white p-3 text-center dark:border-slate-700/70 dark:bg-slate-950/40 min-[1230px]:min-h-[calc(100vh-20px)]"
  >
    <button
      type="button"
      aria-pressed={isStarted}
      onclick={toggleStarted}
      class={`absolute right-3 top-3 cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none ${
        isStarted
          ? "border border-cyan-400 bg-transparent dark:text-cyan-300 hover:bg-cyan-400/10"
          : "bg-cyan-500 text-slate-800 hover:bg-cyan-400"
      }`}
    >
      {isStarted ? "Stop" : "Start"}
    </button>
    <div class="flex flex-col items-center">
      <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
        Chord information
      </p>
      <p class="mt-3 text-2xl font-semibold text-cyan-700 dark:text-cyan-300">
        Stopped
      </p>
    </div>
  </div>

  <div
    class="scrollbar-hidden min-w-[600px] w-full flex-1 min-[1230px]:max-h-[calc(100vh-20px)] min-[1230px]:w-[600px] min-[1230px]:max-w-[600px] min-[1230px]:flex-none min-[1230px]:overflow-y-auto"
  >
    <div
      class="hidden items-center justify-center gap-1.5 min-[1230px]:flex min-[1230px]:w-[600px] min-[1230px]:flex-none mb-3"
    >
      <h1 class="text-center text-3xl text-cyan-700 dark:text-cyan-100">
        Celeste
      </h1>
      <span class="mt-3 text-sm text-slate-600 dark:text-slate-400"
        >by Ethan Solace</span
      >
    </div>

    <details
      class="w-full rounded-lg border border-slate-300 bg-white dark:border-slate-700/70 dark:bg-slate-950/40"
      open
    >
      <summary
        class="cursor-pointer select-none p-3 text-sm font-medium text-slate-900 outline-none transition hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-400/50 dark:text-slate-100 dark:hover:text-cyan-300"
      >
        MIDI Devices
      </summary>
      <div
        class="flex gap-1.5 border-t border-slate-300 p-3 dark:border-slate-700/70"
      >
        <div class="min-w-0 flex-1">
          <select
            id="midi-device"
            value={selectedInputId}
            onchange={selectInput}
            disabled={midiInputs.length === 0}
            class="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              {midiInputs.length === 0
                ? "No MIDI devices found"
                : "MIDI device"}
            </option>
            {#each midiInputs as input (input.id)}
              <option value={input.id}
                >{input.name || "Unnamed MIDI device"}</option
              >
            {/each}
          </select>
        </div>

        <div class="w-24">
          <select
            id="midi-channel"
            bind:value={selectedChannel}
            class="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400"
          >
            <option value="" disabled hidden>Channel</option>
            {#each channels as channel}
              <option
                value={channel}
                disabled={isChannelUsed(selectedInputId, channel)}
              >
                {channel}{isChannelUsed(selectedInputId, channel)
                  ? " (in use)"
                  : ""}
              </option>
            {/each}
          </select>
        </div>
        <div class="w-28">
          <select
            id="midi-voicing"
            value={selectedVoicing}
            placeholder="Voicing"
            onchange={selectVoicing}
            class="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400"
          >
            <option value="" disabled hidden>Voicing</option>
            <option value="1">Sub Bass</option>
            <option value="2">Bass</option>
            <option value="3">Mid - Low</option>
            <option value="4">Mid - High</option>
            <option value="5">Treble</option>
          </select>
        </div>
        <div class="w-28">
          <select
            id="midi-voice-count"
            bind:value={voiceCount}
            disabled={selectedVoicing === "1" ||
              selectedVoicing === "2" ||
              !selectedVoicing}
            class="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {#if selectedVoicing === "1" || selectedVoicing === "2"}
              <option value="1">1</option>
            {:else}
              <option value="" disabled hidden>Voice count</option>
              {#each channels as channel}
                <option value={channel}>{channel}</option>
              {/each}
            {/if}
          </select>
        </div>
        <button
          type="button"
          onclick={addDevice}
          disabled={!selectedInputId ||
            !selectedVoicing ||
            !voiceCount ||
            isChannelUsed(selectedInputId, Number(selectedChannel))}
          class="h-10 rounded-md bg-cyan-500 px-3 text-sm font-medium text-slate-800 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          Add device
        </button>
      </div>
      {#if selectedDevices.length > 0}
        <ul class="px-3">
          {#each selectedDevices as device (device.id)}
            <li
              class="flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-900 mb-3"
            >
              <span
                class="min-w-0 flex-1 truncate text-xs text-slate-900 dark:text-slate-100"
              >
                {device.name}
              </span>

              <span class="text-xs text-slate-600 dark:text-slate-400"
                >Ch. {device.channel}</span
              >
              <span class="text-xs text-slate-600 dark:text-slate-400"
                >{device.voiceCount} Voice{device.voiceCount !== 1
                  ? "s"
                  : ""}</span
              >
              <span class="text-xs text-slate-600 dark:text-slate-400"
                >{voiceName(device.voicing)}</span
              >

              <button
                type="button"
                onclick={() => removeDevice(device.id)}
                class="rounded px-1.5 py-1 text-xs text-red-400 transition hover:bg-red-400/10 hover:text-red-300 cursor-pointer transition focus:border-red-400 focus:ring-2 focus:ring-red-400/30"
              >
                Delete
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if error}
        <p class="mt-3 text-sm text-red-400">{error}</p>
      {/if}
    </details>

    <details
      class="mt-2.5 w-full rounded-lg border border-slate-300 bg-white dark:border-slate-700/70 dark:bg-slate-950/40"
      open
    >
      <summary
        class="cursor-pointer select-none px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-400/50 dark:text-slate-100 dark:hover:text-cyan-300"
      >
        Settings
      </summary>
      <div
        class="border-t border-slate-300 p-3 text-sm text-slate-600 dark:border-slate-700/70 dark:text-slate-400"
      >
        <div class="flex items-center justify-between gap-4">
          <label
            for="theme-mode"
            class="font-medium text-slate-900 dark:text-slate-100"
          >
            Theme
          </label>
          <select
            id="theme-mode"
            value={themeMode}
            onchange={selectTheme}
            class="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400"
          >
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div class="mt-3 flex items-center justify-between gap-4">
          <label
            for="key"
            class="font-medium text-slate-900 dark:text-slate-100"
          >
            Key
          </label>
          <select
            id="key"
            bind:value={selectedKey}
            class="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400"
          >
            <optgroup label="Major">
              <option value="C-major">C Major</option>
              <option value="C#-major">C# Major / Db Major</option>
              <option value="D-major">D Major</option>
              <option value="Eb-major">Eb Major</option>
              <option value="E-major">E Major</option>
              <option value="F-major">F Major</option>
              <option value="F#-major">F# Major / Gb Major</option>
              <option value="G-major">G Major</option>
              <option value="Ab-major">Ab Major</option>
              <option value="A-major">A Major</option>
              <option value="Bb-major">Bb Major</option>
              <option value="B-major">B Major / Cb Major</option>
            </optgroup>
            <optgroup label="Minor">
              <option value="C-minor">C Minor</option>
              <option value="C#-minor">C# Minor</option>
              <option value="D-minor">D Minor</option>
              <option value="Eb-minor">D# Minor / Eb Minor</option>
              <option value="E-minor">E Minor</option>
              <option value="F-minor">F Minor</option>
              <option value="F#-minor">F# Minor</option>
              <option value="G-minor">G Minor</option>
              <option value="G#-minor">G# Minor / Ab Minor</option>
              <option value="A-minor">A Minor</option>
              <option value="Bb-minor">A# Minor / Bb Minor</option>
              <option value="B-minor">B Minor</option>
            </optgroup>
          </select>
        </div>
        <div class="mt-3 flex items-center justify-between gap-4">
          <label
            for="bpm"
            class="font-medium text-slate-900 dark:text-slate-100"
          >
            BPM
          </label>
          <input
            id="bpm"
            type="number"
            min="1"
            max="300"
            bind:value={bpm}
            class="w-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-right text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400"
          />
        </div>
        <div class="mt-3 flex items-center justify-between gap-4">
          <label
            for="time-signature"
            class="font-medium text-slate-900 dark:text-slate-100"
          >
            Time signature
          </label>
          <select
            id="time-signature"
            bind:value={timeSignature}
            class="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400"
          >
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="4/4">4/4</option>
            <option value="6/8">6/8</option>
            <option value="7/8">7/8</option>
            <option value="12/8">12/8</option>
          </select>
        </div>
        <div class="mt-3 flex items-center justify-between gap-4">
          <label
            for="chord-change-rate"
            class="font-medium text-slate-900 dark:text-slate-100"
          >
            Change chord
          </label>
          <select
            id="chord-change-rate"
            bind:value={chordChangeRate}
            class="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-cyan-400"
          >
            <option value="beat">By beat</option>
            <option value="measure">Per measure</option>
            <option value="two-measures">Per 2 measures</option>
          </select>
        </div>
        <div
          class="mt-3 grid grid-cols-[minmax(0,1fr)_10rem_2rem] items-center gap-4"
        >
          <label
            for="complexity"
            class="font-medium text-slate-900 dark:text-slate-100"
          >
            Complexity
          </label>
          <input
            id="complexity"
            type="range"
            min="1"
            max="100"
            bind:value={complexity}
            class="w-full accent-cyan-500"
          />
          <span class="text-right text-slate-600 dark:text-slate-400"
            >{complexity}</span
          >
        </div>
        <div
          class="mt-3 grid grid-cols-[minmax(0,1fr)_10rem_2rem] items-center gap-4"
        >
          <label
            for="conventionalism"
            class="font-medium text-slate-900 dark:text-slate-100"
          >
            Conventionalism
          </label>
          <input
            id="conventionalism"
            type="range"
            min="1"
            max="100"
            bind:value={conventionalism}
            class="w-full accent-cyan-500"
          />
          <span class="text-right text-slate-600 dark:text-slate-400"
            >{conventionalism}</span
          >
        </div>
        <div
          class="mt-3 grid grid-cols-[minmax(0,1fr)_10rem_2rem] items-center gap-4"
        >
          <label
            for="voice-spread"
            class="font-medium text-slate-900 dark:text-slate-100"
          >
            Voice Spread
          </label>
          <input
            id="voice-spread"
            type="range"
            min="1"
            max="100"
            bind:value={voiceSpread}
            class="w-full accent-cyan-500"
          />
          <span class="text-right text-slate-600 dark:text-slate-400"
            >{voiceSpread}</span
          >
        </div>
        <button
          type="button"
          onclick={cutOffAllVoices}
          class="mt-4 rounded-md border border-red-300 px-3 py-2 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-400/60 dark:text-red-300 dark:hover:bg-red-400/10"
        >
          Cut off all voices
        </button>
      </div>
    </details>
  </div>
</div>
