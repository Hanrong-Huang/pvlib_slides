## Page 1: Title Slide

# Introduction to the pvlib Python Package

**An Interactive Journey**

**Your Name/Affiliation**

**Date**

**(Subtle background animation: A time-lapse of clouds moving across a sky with the sun's path subtly traced)**

---

## Page 2: What is pvlib?

*   **pvlib python** is a free, open-source toolbox for simulating the performance of photovoltaic (PV) energy systems.
*   It provides reliable and benchmark implementations of PV system models.
*   It is widely used for solar resource assessment, PV system modeling, and energy forecasting.

***

**Interactive Visualization:**

**(A globe appears on the right side of the slide. As the user hovers over different continents, pins drop at various locations. Clicking on a pin reveals a small pop-up with a hypothetical project title, e.g., "Utility-Scale Solar Farm - Arizona, USA" or "Rooftop Solar Analysis - Munich, Germany," showcasing the global application of pvlib.)**

---

## Page 3: A Brief History

*   `pvlib` originated at Sandia National Laboratories as "PVLIB for Matlab".
*   The Python version began in 2013 and was first released on PyPI in 2015.
*   It has since grown into a major community-driven project with over 100 contributors.
*   `pvlib` is a NumFOCUS Affiliated Project and ranks in the top 1% of PyPI packages by download count.

***

**Animated Timeline:**

**(A horizontal timeline animates from left to right, with key milestones appearing sequentially as the line progresses. For example: "2013: Python version started", "2015: First PyPI release", "Present: Top 1% of PyPI packages". Each milestone could have a subtle glowing effect upon appearing.)**

---

## Page 4: Why Use pvlib?

*   **Open and Flexible:** Offers transparency and allows for custom analysis.
*   **Standardized and Validated:** Provides a common repository for published modeling algorithms.
*   **Community Driven:** Continuously improved by a large and active community of academic and commercial users.
*   **Comprehensive:** Offers a wide range of functions for detailed PV system performance analysis.

***

**Interactive Element:**

**(Below the bullet points, there are three clickable buttons: "For Researchers", "For Engineers", and "For Students". Clicking each button reveals a short testimonial or a use case tailored to that audience, for example: "For Researchers: 'pvlib allows me to easily compare my novel irradiance model against established benchmarks.'")**

---

## Page 5: Core Functionality: The "Weather-to-Power" Chain

`pvlib` models the entire journey from sunlight to electricity.

***

**Animated Diagram:**

**(A full-screen animated diagram illustrates the "weather-to-power" simulation chain. It starts with a sun icon emitting rays. The rays travel down to a PV panel. From the panel, a line representing DC electricity flows to an inverter, and finally, a line representing AC electricity flows to a house icon. Each stage of the process is labeled and appears sequentially as the animation progresses: "1. Solar Position", "2. Irradiance & Weather", "3. Plane of Array Irradiance", "4. PV Cell Temperature", "5. DC Power", "6. AC Power".)**

---

## Page 6: Key Modeling Components: An Interactive Look

`pvlib` is structured to model each step of the PV system.

***

**Interactive Diagram:**

**(A static diagram of a complete PV system is shown. Key components like the "PV Module," "Inverter," "Mounting System," and "Location" are clickable. When a user clicks on a component, it enlarges or highlights, and a text box appears with a brief description of how `pvlib` models that component. For example, clicking on the "PV Module" could show: "Model the DC power output with functions like `pvsystem.retrieve_sam` to get module specifications and `pvsystem.pvwatts_dc` to calculate power.")**

---

## Page 7: Modeling Paradigms

`pvlib` offers different approaches to building your simulations:

*   **Procedural:** Maximum flexibility by calling individual functions for each step.
*   **Object-Oriented:** Organize your workflow with classes like `Location` and `PVSystem`.
*   **ModelChain:** A high-level class for running a complete simulation from weather data to AC power.

***

**Interactive Code Snippet:**

**(Three tabs are presented: "Procedural", "Object-Oriented", and "ModelChain". Each tab displays a simplified Python code snippet demonstrating that approach. The user can click through the tabs to compare the different coding styles for achieving a similar outcome.)**

---

## Page 8: Installation

Getting `pvlib` is straightforward:

**Using pip:**
```bash
pip install pvlib
```

**Using conda:**
```bash
conda install -c conda-forge pvlib
```

The latest version, 0.13.0, was released on June 7, 2025.

***

**(A simple animation of a terminal window where the `pip install pvlib` command is being typed out, followed by a simulated installation process with a progress bar that completes.)**

---

## Page 9: A Simple "Weather-to-Power" Example

Let's bring it all together with the `ModelChain`.

***

**Interactive Code Walkthrough:**

**(A code editor interface is embedded in the slide with the following Python code. The user can click a "Run" button. When they do, each line of the code is highlighted sequentially, and a corresponding visualization appears or updates on the right. For example, when the `location` line is highlighted, a map shows the location. When the `mc.run_model(weather)` line is highlighted, the plot of AC power dynamically draws itself.)**

```python
import pvlib

# 1. Define Location and System
location = pvlib.location.Location(latitude=32.2, longitude=-110.9)
system = pvlib.pvsystem.PVSystem(surface_tilt=30, surface_azimuth=180)

# 2. Get Weather Data (e.g., TMY)
# In a real scenario, you'd load TMY data. Here we'll use clear-sky for simplicity.
times = pvlib.tsutils.generate_tmy_times('2023-07-14', location.latitude, location.longitude)
weather = location.get_clearsky(times)

# 3. Create and Run the ModelChain
mc = pvlib.modelchain.ModelChain(system, location)
mc.run_model(weather)

# 4. View Results
# The plot will appear here after clicking "Run"
mc.results.ac.plot()
```

---

## Page 10: Interactive Exploration: The Impact of Tilt Angle

See for yourself how changing the tilt angle of a solar panel affects its energy output.

***

**Interactive Simulation:**

**(A simple interface is provided with a slider labeled "Panel Tilt Angle" ranging from 0 to 90 degrees. Below the slider, a line chart shows the simulated daily energy production. As the user moves the slider, the chart updates in real-time to reflect the new energy output based on the selected tilt angle. The location and other system parameters are fixed for this demonstration.)**

---

## Page 11: The pvlib Ecosystem

`pvlib` is part of a larger ecosystem of open-source tools for solar energy analysis.

*   **pvanalytics:** For data quality control and performance analysis.
*   **iotools:** For fetching weather data from various sources like NSRDB and CAMS.

***

**(An animated Venn diagram or a connected-bubbles diagram shows `pvlib` at the center, with `pvanalytics` and `iotools` as connected, slightly overlapping circles, visually representing their relationship.)**

---

## Page 12: Community and Support

*   **Documentation:** [pvlib-python.readthedocs.io](https://pvlib-python.readthedocs.io)
*   **GitHub:** Source code and issue tracking.
*   **Google Group:** Discussions and announcements.
*   **Stack Overflow:** For usage questions.

***

**(Each of the support channels is represented by its logo. When the user hovers over a logo, it enlarges, and a tooltip appears with a brief description of what they can find there.)**

---

## Page 13: Citing pvlib

If you use `pvlib` in a published work, please cite it. Proper citation is vital for the project's contributors.

**Recommended citation:**
Anderson, K., Hansen, C., Holmgren, W., Jensen, A., Mikofski, M., and Driesse, A. “pvlib python: 2023 project update.” Journal of Open Source Software, 8(92), 5994, (2023).

***

**(A subtle animation of a pen writing the citation on the screen.)**

---

## Page 14: Conclusion

*   `pvlib` is a powerful and flexible open-source tool for PV system modeling.
*   It is built on a foundation of well-documented and validated models.
*   The strong community and open-source nature of `pvlib` make it a valuable asset for the solar energy field.

***

**(The "weather-to-power" animation from Page 5 plays again in a smaller, continuous loop in the corner of the slide.)**

---

## Page 15: Q&A

# Questions?

**(The interactive globe from Page 2 is shown again, slowly rotating, inviting questions about global applications.)**