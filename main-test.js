import {
    provideFluentDesignSystem, 
    fluentButton,
    fluentRadio,
    fluentRadioGroup,
    fluentCheckbox,
    fluentSlider,
    fluentSliderLabel
        } from "https://unpkg.com/@fluentui/web-components@2.0.0";

provideFluentDesignSystem().register(
    fluentButton(),
    fluentRadio(),
    fluentRadioGroup(),
    fluentCheckbox(),
    fluentSlider(),
    fluentSliderLabel()
    );
