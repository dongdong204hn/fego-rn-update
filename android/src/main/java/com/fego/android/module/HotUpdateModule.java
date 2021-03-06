package com.fego.android.module;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.fego.android.service.ReactManager;

/**
 * 用于在js中想要进行bundle更新的逻辑
 * Created by sxiaoxia on 2017/12/7.
 */
public class HotUpdateModule extends ReactContextBaseJavaModule {

    /**
     * Instantiates a new Hot update module.
     *
     * @param reactContext the react context
     */
    public HotUpdateModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    /**
     * Gets name.
     *
     * @return the name
     */
    @Override
    public String getName() {
        return "FegoRnUpdate";
    }

    /**
     * Hot reload.
     */
    @ReactMethod
    public void hotReload() {
        ReactManager.getInstance().loadBundleBehind();
    }
}
